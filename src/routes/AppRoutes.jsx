import { Navigate, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'
import Register from '../pages/Register'
import AdminLayout from '../layouts/AdminLayout'
import AdminPlaceholder from '../pages/admin/AdminPlaceholder'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'
import RoleDashboardPlaceholder from '../pages/RoleDashboardPlaceholder'
import MembersPage from '../features/admin/members/MembersPage'

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
        <Route path="/member/dashboard" element={<RoleDashboardPlaceholder title="Member Dashboard" role="member" />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
