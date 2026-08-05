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
import RoleDashboardPlaceholder from '../pages/RoleDashboardPlaceholder'

const adminPages = [
  ['dashboard', 'Dashboard'],
  ['trainers', 'Trainers'],
  ['membership-plans', 'Membership Plans'],
  ['memberships', 'Memberships'],
  ['payments', 'Payments'],
  ['attendance', 'Attendance'],
  ['equipment', 'Equipment'],
  ['maintenance', 'Maintenance'],
  ['reports', 'Reports'],
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
          <Route path="members" element={<MembersPage />} />
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
        <Route path="/trainer/dashboard" element={<RoleDashboardPlaceholder title="Trainer Dashboard" role="trainer" />} />
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
