<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Equipment\StoreEquipmentRequest;
use App\Http\Requests\Equipment\UpdateEquipmentRequest;
use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EquipmentController extends Controller
{
    /**
     * Return all equipment for Admin management.
     */
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->input('search', ''));
        $category = strtolower((string) $request->input('category', 'all'));
        $condition = strtolower((string) $request->input('condition', 'all'));
        $status = strtolower((string) $request->input('status', 'all'));
        $maintenanceStatus = strtolower((string) $request->input('maintenance_status', 'all'));
        $perPage = max(1, min($request->integer('per_page', 10), 25));
        $now = Carbon::now();
        $dueSoonUntil = $now->copy()->addDays(Equipment::DUE_SOON_DAYS);

        $equipment = Equipment::query()
            ->when($search !== '', function ($equipmentQuery) use ($search): void {
                $equipmentQuery->where(function ($subQuery) use ($search): void {
                    $subQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('asset_code', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%");
                });
            })
            ->when(
                in_array($category, ['cardio', 'strength', 'free_weights', 'functional', 'accessories', 'other'], true),
                fn ($equipmentQuery) => $equipmentQuery->where('category', $category),
            )
            ->when(
                in_array($condition, ['excellent', 'good', 'fair', 'poor', 'damaged'], true),
                fn ($equipmentQuery) => $equipmentQuery->where('condition', $condition),
            )
            ->when(
                in_array($status, ['operational', 'under_maintenance', 'out_of_service', 'retired'], true),
                fn ($equipmentQuery) => $equipmentQuery->where('status', $status),
            )
            ->when(
                in_array($maintenanceStatus, ['none', 'scheduled', 'due_soon', 'overdue', 'under_maintenance'], true),
                function ($equipmentQuery) use ($maintenanceStatus, $now, $dueSoonUntil): void {
                    if ($maintenanceStatus === 'under_maintenance') {
                        $equipmentQuery->where('status', 'under_maintenance');

                        return;
                    }

                    $equipmentQuery->where('status', '!=', 'under_maintenance');

                    if ($maintenanceStatus === 'none') {
                        $equipmentQuery->whereNull('next_maintenance_at');
                    } elseif ($maintenanceStatus === 'scheduled') {
                        $equipmentQuery
                            ->whereNotNull('next_maintenance_at')
                            ->where('next_maintenance_at', '>', $dueSoonUntil);
                    } elseif ($maintenanceStatus === 'due_soon') {
                        $equipmentQuery->whereBetween('next_maintenance_at', [$now, $dueSoonUntil]);
                    } elseif ($maintenanceStatus === 'overdue') {
                        $equipmentQuery
                            ->whereNotNull('next_maintenance_at')
                            ->where('next_maintenance_at', '<', $now);
                    }
                },
            )
            ->orderBy('name')
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Equipment retrieved successfully.',
            'data' => [
                'data' => EquipmentResource::collection($equipment->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $equipment->currentPage(),
                    'last_page' => $equipment->lastPage(),
                    'per_page' => $equipment->perPage(),
                    'total' => $equipment->total(),
                    'from' => $equipment->firstItem(),
                    'to' => $equipment->lastItem(),
                ],
                'filters' => [
                    'categories' => ['cardio', 'strength', 'free_weights', 'functional', 'accessories', 'other'],
                    'conditions' => ['excellent', 'good', 'fair', 'poor', 'damaged'],
                    'statuses' => ['operational', 'under_maintenance', 'out_of_service', 'retired'],
                    'maintenance_statuses' => ['none', 'scheduled', 'due_soon', 'overdue', 'under_maintenance'],
                ],
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $equipment = Equipment::query()->find($id);

        if (! $equipment) {
            return response()->json(['message' => 'Equipment not found.'], 404);
        }

        return response()->json([
            'message' => 'Equipment retrieved successfully.',
            'data' => (new EquipmentResource($equipment))->resolve(),
        ]);
    }

    public function store(StoreEquipmentRequest $request): JsonResponse
    {
        $equipment = DB::transaction(function () use ($request): Equipment {
            $equipment = Equipment::create($request->validated());
            $equipment->asset_code = 'EQ-' . str_pad((string) $equipment->id, 6, '0', STR_PAD_LEFT);
            $equipment->save();

            return $equipment;
        });

        return response()->json([
            'message' => 'Equipment created successfully.',
            'data' => (new EquipmentResource($equipment))->resolve(),
        ], 201);
    }

    public function update(UpdateEquipmentRequest $request, int $id): JsonResponse
    {
        $equipment = Equipment::query()->find($id);

        if (! $equipment) {
            return response()->json(['message' => 'Equipment not found.'], 404);
        }

        $equipment->update($request->validated());

        return response()->json([
            'message' => 'Equipment updated successfully.',
            'data' => (new EquipmentResource($equipment->fresh()))->resolve(),
        ]);
    }
}
