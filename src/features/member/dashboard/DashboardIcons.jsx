import { Award, CalendarCheck, Check, Clock3, CreditCard, Dumbbell, Flame, Sunrise, Target, Trophy, UserRound } from 'lucide-react'

const icons = { award: Award, calendar: CalendarCheck, card: CreditCard, check: Check, clock: Clock3, dumbbell: Dumbbell, flame: Flame, sunrise: Sunrise, target: Target, trophy: Trophy, user: UserRound }

export default function DashboardIcon({ name, ...props }) { const Icon = icons[name] || Award; return <Icon {...props} /> }
