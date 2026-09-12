<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Maintenance\StoreMaintenanceRecordRequest;
use App\Http\Requests\Maintenance\UpdateMaintenanceRecordRequest;
use App\Http\Resources\MaintenanceRecordResource;
use App\Models\MaintenanceRecord;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MaintenanceController extends Controller
{
    private const MAINTENANCE_TYPES = ['preventive', 'repair', 'inspection', 'cleaning', 'replacement', 'other'];
    private const STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'];

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'equipment_id' => ['nullable', 'integer', Rule::exists('equipment', 'id')],
            'maintenance_type' => ['nullable', Rule::in(self::MAINTENANCE_TYPES)],
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:25'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $perPage = (int) ($filters['per_page'] ?? 10);

        $records = $this->maintenanceQuery()
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $searchQuery) use ($search): void {
                    $searchQuery
                        ->where('description', 'like', "%{$search}%")
                        ->orWhere('notes', 'like', "%{$search}%")
                        ->orWhereHas('equipment', function (Builder $equipmentQuery) use ($search): void {
                            $equipmentQuery
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('asset_code', 'like', "%{$search}%")
                                ->orWhere('brand', 'like', "%{$search}%")
                                ->orWhere('model', 'like', "%{$search}%");
                        });
                });
            })
            ->when(isset($filters['equipment_id']), fn (Builder $query) => $query->where('equipment_id', $filters['equipment_id']))
            ->when(isset($filters['maintenance_type']), fn (Builder $query) => $query->where('maintenance_type', $filters['maintenance_type']))
            ->when(isset($filters['status']), fn (Builder $query) => $query->where('status', $filters['status']))
            ->when(isset($filters['date_from']), fn (Builder $query) => $query->whereDate('maintenance_date', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn (Builder $query) => $query->whereDate('maintenance_date', '<=', $filters['date_to']))
            ->latest('maintenance_date')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Maintenance records retrieved successfully.',
            'data' => [
                'data' => MaintenanceRecordResource::collection($records->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $records->currentPage(),
                    'last_page' => $records->lastPage(),
                    'per_page' => $records->perPage(),
                    'total' => $records->total(),
                    'from' => $records->firstItem(),
                    'to' => $records->lastItem(),
                ],
                'filters' => [
                    'maintenance_types' => self::MAINTENANCE_TYPES,
                    'statuses' => self::STATUSES,
                ],
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->maintenanceQuery()->find($id);

        if (! $record) {
            return response()->json(['message' => 'Maintenance record not found.'], 404);
        }

        return response()->json([
            'message' => 'Maintenance record retrieved successfully.',
            'data' => (new MaintenanceRecordResource($record))->resolve(),
        ]);
    }

    public function store(StoreMaintenanceRecordRequest $request): JsonResponse
    {
        $record = MaintenanceRecord::create($request->validated());
        $record = $this->maintenanceQuery()->findOrFail($record->id);

        return response()->json([
            'message' => 'Maintenance record created successfully.',
            'data' => (new MaintenanceRecordResource($record))->resolve(),
        ], 201);
    }

    public function update(UpdateMaintenanceRecordRequest $request, int $id): JsonResponse
    {
        $record = MaintenanceRecord::query()->find($id);

        if (! $record) {
            return response()->json(['message' => 'Maintenance record not found.'], 404);
        }

        $record->update($request->validated());
        $record = $this->maintenanceQuery()->findOrFail($record->id);

        return response()->json([
            'message' => 'Maintenance record updated successfully.',
            'data' => (new MaintenanceRecordResource($record))->resolve(),
        ]);
    }

    private function maintenanceQuery(): Builder
    {
        return MaintenanceRecord::query()->with([
            'equipment:id,name,asset_code,brand,model',
        ]);
    }
}
