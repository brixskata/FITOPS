import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Mail, UsersRound } from 'lucide-react'
import { Reveal, Stagger, staggerItem } from '../../member/dashboard/Motion'

const formatDate = (value) => value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : null

function MemberCard({ member }) {
  const initials = member.name?.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'M'
  const membership = member.membership || {}
  const hasMembership = Boolean(membership.plan_name)
  const hasAttendance = member.attendance?.total_visits > 0

  return <motion.article variants={staggerItem} whileHover={{ y: -4, boxShadow: '0 20px 55px rgba(18,18,18,0.08)' }} transition={{ duration: 0.3 }} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_16px_50px_rgba(18,18,18,0.04)]"><div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-accent">{initials}</span><div className="min-w-0 flex-1"><h3 className="truncate text-base font-bold text-ink">{member.name || 'Unnamed member'}</h3><p className="mt-1 flex items-center gap-1.5 truncate text-xs text-ink/50"><Mail size={13} />{member.email || 'Email unavailable'}</p></div><span className="rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-bold uppercase text-ink">{member.status || 'Unknown'}</span></div><div className="mt-5 grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Membership</p><p className="mt-1 text-sm font-semibold text-ink">{membership.plan_name || 'No membership'}</p><p className="mt-1 text-xs text-ink/50">{membership.status_label || 'No membership information'}</p>{membership.starts_at || membership.ends_at ? <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/50"><CalendarDays size={13} />{formatDate(membership.starts_at) || '—'} to {formatDate(membership.ends_at) || '—'}</p> : null}</div><div><p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Attendance</p>{hasAttendance ? <><p className="mt-1 text-sm font-semibold text-ink">{member.attendance.total_visits} visits</p><p className="mt-1 flex items-center gap-1.5 text-xs text-ink/50"><CheckCircle2 size={13} />Latest check-in recorded</p></> : <p className="mt-1 text-sm text-ink/50">No attendance yet</p>}</div></div></motion.article>
}

export default function AssignedMembers({ members }) {
  return <Reveal as="section" id="assigned-members"><div className="flex items-end justify-between gap-4"><div><p className="section-kicker text-ink/45">Your roster</p><h2 className="mt-2 font-heading text-3xl uppercase text-ink">Assigned members</h2></div><span className="text-xs font-semibold text-ink/55">{members.length} assigned</span></div>{members.length ? <Stagger className="mt-5 grid gap-4 lg:grid-cols-2">{members.map((member) => <MemberCard key={member.id} member={member} />)}</Stagger> : <div className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center"><UsersRound className="mx-auto text-ink/35" size={28} /><p className="mt-4 text-sm font-semibold text-ink">No members assigned yet.</p><p className="mt-1 text-xs text-ink/50">Assigned members will appear here when your roster is updated.</p></div>}</Reveal>
}
