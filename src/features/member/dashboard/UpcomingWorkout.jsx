import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, MapPin, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from './Motion'

export default function UpcomingWorkout({ schedule }) {
  const workout = schedule?.[0]

  return <Reveal as="section" className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_16px_50px_rgba(18,18,18,0.04)] transition-shadow duration-300 hover:shadow-[0_20px_55px_rgba(18,18,18,0.08)]"><div className="bg-ink p-6 text-white sm:p-7"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">Next on your schedule</p><h2 className="mt-3 font-heading text-3xl uppercase">Today's workout</h2></div>{workout && <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/65">{workout.time}</span>}</div><p className="mt-4 text-sm text-white/60">{workout?.title || 'No upcoming schedule'}</p></div><div className="space-y-4 p-6 sm:p-7">{workout ? <><div className="flex items-center gap-3 text-sm text-ink/65"><CalendarDays size={17} className="text-ink/40" />{workout.date} · {workout.time}</div><div className="flex items-center gap-3 text-sm text-ink/65"><UserRound size={17} className="text-ink/40" />{workout.trainer}</div><div className="flex items-center gap-3 text-sm text-ink/65"><MapPin size={17} className="text-ink/40" />{workout.location}</div></> : <p className="text-sm text-ink/55">Your upcoming workouts will appear here when they are scheduled.</p>}<Link to="/member/attendance" className="group mt-3 inline-flex items-center gap-2 text-sm font-bold text-ink transition hover:text-accent">View schedule <motion.span whileHover={{ x: 4 }} transition={{ duration: 0.25 }}><ArrowUpRight size={16} /></motion.span></Link></div></Reveal>
}
