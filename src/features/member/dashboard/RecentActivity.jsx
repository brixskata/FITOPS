import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardIcon from './DashboardIcons'
import { dashboardActivity } from './DashboardData'
import { Reveal, Stagger, staggerItem } from './Motion'

export default function RecentActivity() { return <Reveal as="section" className="rounded-2xl border border-ink/10 bg-white p-6 shadow-[0_16px_50px_rgba(18,18,18,0.04)] transition-shadow duration-300 hover:shadow-[0_20px_55px_rgba(18,18,18,0.08)] sm:p-7"><div className="flex items-center justify-between"><div><p className="section-kicker text-ink/45">Your journey</p><h2 className="mt-2 font-heading text-3xl uppercase text-ink">Recent activity</h2></div><Link to="/member/attendance" className="text-xs font-bold uppercase tracking-wider text-ink/55 transition hover:text-ink">See all <ArrowUpRight className="ml-1 inline" size={14} /></Link></div><Stagger className="relative mt-7 space-y-6 before:absolute before:bottom-3 before:left-5 before:top-3 before:w-px before:bg-ink/10">{dashboardActivity.map((item) => <motion.div key={item.title} variants={staggerItem} className="relative flex items-start gap-4"><span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-ink"><DashboardIcon name={item.icon} size={16} /></span><div className="pt-1"><p className="text-sm font-bold text-ink">{item.title}</p><p className="mt-1 text-xs text-ink/55">{item.detail}</p></div></motion.div>)}</Stagger></Reveal> }
