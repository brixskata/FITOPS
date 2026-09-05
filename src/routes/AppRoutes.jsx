import { Navigate, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'
import Register from '../pages/Register'
import AdminLayout from '../layouts/AdminLayout'
import AdminPlaceholder from '../pages/admin/AdminPlaceholder'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'
import MembersPage from '../features/admin/members/MembersPage'
import MemberLayout from '../features/member/MemberLayout'
import MemberDashboard from '../features/member/pages/MemberDashboard'
import MyMembership from '../features/member/pages/MyMembership'
import Attendance from '../features/member/pages/Attendance'
import Payments from '../features/member/pages/Payments'
import MyProfile from '../features/member/pages/MyProfile'
import MemberSettings from '../features/member/pages/MemberSettings'
import TrainerLayout from '../features/trainer/TrainerLayout'
import TrainerDashboard from '../features/trainer/pages/TrainerDashboard'
import TrainerAttendancePage from '../features/trainer/attendance/TrainerAttendancePage'
import TrainerMembersPage from '../features/trainer/members/TrainerMembersPage'
import TrainersPage from '../features/admin/trainers/TrainersPage'
import MembershipPlansPage from '../features/admin/membershipPlans/MembershipPlansPage'
import MembershipsPage from '../features/admin/memberships/MembershipsPage'
import PaymentsPage from '../features/admin/payments/PaymentsPage'
import AttendancePage from '../features/admin/attendance/AttendancePage'
import AdminDashboardPage from '../features/admin/dashboard/AdminDashboardPage'
import EquipmentPage from '../features/admin/equipment/EquipmentPage'
import ReportsPage from '../features/admin/reports/ReportsPage'

const adminPages = [
  ['maintenance', 'Maintenance'],
  ['settings', 'Settings'],
]

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="trainers" element={<TrainersPage />} />
          <Route path="membership-plans" element={<MembershipPlansPage />} />
          <Route path="memberships" element={<MembershipsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="reports" element={<ReportsPage />} />
          {adminPages.map(([path, title]) => (
            <Route
              key={path}
              path={path}
              element={<AdminPlaceholder title={title} />}
            />
          ))}
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
        <Route path="/trainer" element={<TrainerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TrainerDashboard />} />
          <Route path="members" element={<TrainerMembersPage />} />
          <Route path="attendance" element={<TrainerAttendancePage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['member']} />}>
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="membership" element={<MyMembership />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="settings" element={<MemberSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
