import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import ConfirmLogoutDialog from '../components/layout/ConfirmLogoutDialog'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'
import PageContainer from '../components/layout/PageContainer'
import useAuth from '../hooks/useAuth'

export default function AdminLayout() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const closeLogoutDialog = () => {
    if (!loggingOut) setLogoutDialogOpen(false)
  }

  const confirmLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      setLogoutDialogOpen(false)
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-ink">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogoutRequest={() => setLogoutDialogOpen(true)} />
      <div className="min-h-screen lg:pl-72">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main>
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
      <ConfirmLogoutDialog open={logoutDialogOpen} loading={loggingOut} onCancel={closeLogoutDialog} onConfirm={confirmLogout} />
    </div>
  )
}
