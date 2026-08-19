import { motion } from 'framer-motion'
import { AnimatedNumber, staggerItem } from '../../member/dashboard/Motion'

export default function TrainerStatCard({ icon: Icon, label, value, detail }) {
  return <motion.div variants={staggerItem} whileHover={{ y: -4, boxShadow: '0 20px 55px rgba(18,18,18,0.08)' }} transition={{ duration: 0.3 }} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-ink"><Icon size={19} /></span><p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p><p className="mt-1 text-3xl font-bold text-ink"><AnimatedNumber value={value} /></p><p className="mt-1 text-xs text-ink/55">{detail}</p></motion.div>
}
