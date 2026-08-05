import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardIcon from './DashboardIcons'
import { Stagger, staggerItem } from './Motion'
import { motion } from 'framer-motion'

const actions = [
  { label: 'Check in', detail: 'Log your visit', icon: 'check', path: '/member/attendance' },
  { label: 'Book session', detail: 'Reserve your spot', icon: 'calendar', path: '/member/membership' },
  { label: 'View attendance', detail: 'See your progress', icon: 'trophy', path: '/member/attendance' },
  { label: 'Pay membership', detail: 'Manage payments', icon: 'card', path: '/member/payments' },
  { label: 'Update profile', detail: 'Keep it current', icon: 'user', path: '/member/profile' },
]

export default function QuickActions() { return <section><div><p className="section-kicker text-ink/45">Make it count</p><h2 className="mt-2 font-heading text-3xl uppercase text-ink">Quick actions</h2></div><Stagger className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{actions.map((action) => <motion.div key={action.label} variants={staggerItem} whileHover={{ y: -4, boxShadow: '0 20px 55px rgba(18,18,18,0.08)' }} transition={{ duration: 0.3 }}><Link to={action.path} className="group block rounded-2xl border border-ink/10 bg-white p-4 shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><motion.span whileHover={{ scale: 1.02 }} className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-ink"><DashboardIcon name={action.icon} size={18} strokeWidth={2} /></motion.span><p className="mt-5 text-sm font-bold text-ink">{action.label}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="text-[11px] text-ink/50">{action.detail}</span><motion.span whileHover={{ x: 4 }} transition={{ duration: 0.25 }}><ArrowUpRight size={14} className="shrink-0 text-ink/35 transition group-hover:text-ink" /></motion.span></div></Link></motion.div>)}</Stagger></section> }
