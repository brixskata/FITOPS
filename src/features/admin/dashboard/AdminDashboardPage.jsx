import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getAdminDashboard } from '../../../services/adminDashboardService'
import AttendanceOverview from './AttendanceOverview'
import DashboardErrorState from './DashboardErrorState'
import LoadingSkeleton from './LoadingSkeleton'
import MembershipStatistics from './MembershipStatistics'
import RecentMembers from './RecentMembers'
import RecentPayments from './RecentPayments'
import RevenueOverview from './RevenueOverview'
import SummaryCards from './SummaryCards'

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDashboard(await getAdminDashboard())
    } catch (loadError) {
      setError(loadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  if (loading) return <LoadingSkeleton />
  if (error || !dashboard) return <DashboardErrorState error={error} onRetry={loadDashboard} />

  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-7 sm:space-y-8"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">Admin workspace</p><h2 className="mt-2 font-heading text-4xl uppercase leading-none tracking-wide text-ink sm:text-5xl">Dashboard</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-ink/55">A live overview of your FitOps gym operations.</p></div><SummaryCards summary={dashboard.summary} /><div className="grid gap-6 lg:grid-cols-2"><MembershipStatistics statistics={dashboard.membership_statistics} /><AttendanceOverview statistics={dashboard.attendance_statistics} summary={dashboard.summary} trend={dashboard.trends?.attendance} /></div><RevenueOverview trend={dashboard.trends?.revenue} /><div className="grid gap-6 lg:grid-cols-2"><RecentMembers members={dashboard.recent_members} /><RecentPayments payments={dashboard.recent_payments} /></div><p className="text-right text-xs text-ink/35">Reporting timezone: {dashboard.reporting_timezone || 'Asia/Manila'}</p></motion.div>
}
