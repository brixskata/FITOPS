import { memberProfile } from '../memberData'
import Achievements from '../dashboard/Achievements'
import HeroCard from '../dashboard/HeroCard'
import MembershipSummary from '../dashboard/MembershipSummary'
import MotivationBanner from '../dashboard/MotivationBanner'
import ProgressCards from '../dashboard/ProgressCards'
import QuickActions from '../dashboard/QuickActions'
import RecentActivity from '../dashboard/RecentActivity'
import UpcomingWorkout from '../dashboard/UpcomingWorkout'
import { Reveal } from '../dashboard/Motion'

export default function MemberDashboard() {
  return <div className="space-y-12 sm:space-y-16">
    <Reveal as="section" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker text-ink/45">Member home</p><h1 className="mt-2 font-heading text-4xl uppercase leading-none tracking-wide text-ink sm:text-5xl">Good morning, {memberProfile.name.split(' ')[0]}</h1><p className="mt-4 text-sm text-ink/60">Stay consistent. Every workout counts.</p></div><p className="hidden text-right text-xs font-semibold uppercase tracking-[0.16em] text-ink/45 sm:block">Thursday · May 15, 2025</p></Reveal>
    <HeroCard />
    <QuickActions />
    <ProgressCards />
    <Achievements />
    <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]"><RecentActivity /><UpcomingWorkout /></div>
    <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]"><MembershipSummary /><MotivationBanner /></div>
  </div>
}
