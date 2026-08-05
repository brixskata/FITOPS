import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from './Motion'

export default function MotivationBanner() {
  return <Reveal as="section" className="relative overflow-hidden rounded-2xl bg-accent p-7 text-ink shadow-[0_16px_50px_rgba(18,18,18,0.08)] sm:p-9"><div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-ink/[0.06]" /><div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink/55">Your next best move</p><h2 className="mt-3 max-w-xl font-heading text-4xl uppercase leading-none sm:text-5xl">Small progress is still progress.</h2></div><motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.25 }}><Link to="/member/attendance" className="group inline-flex w-fit items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-ink">Start today's workout <motion.span whileHover={{ x: 4 }} transition={{ duration: 0.25 }}><ArrowUpRight size={16} /></motion.span></Link></motion.div></div></Reveal>
}
