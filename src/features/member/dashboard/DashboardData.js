export const dashboardMembership = { plan: 'Elite Annual', status: 'Active', daysRemaining: 160, renewalDate: 'January 12, 2026', progress: 56 }

export const dashboardProgress = [
  { label: 'Current streak', value: '6 days', counter: 6, suffix: ' days', detail: 'Best: 12 days', icon: 'flame', progress: 50 },
  { label: 'Monthly attendance', value: '18 / 24', counter: 18, suffix: ' / 24', detail: '6 visits to goal', icon: 'calendar', progress: 75 },
  { label: 'Total visits', value: '148', counter: 148, detail: 'Since joining FitOps', icon: 'trophy', progress: null },
  { label: 'Training hours', value: '26.5h', counter: 26.5, decimals: 1, suffix: 'h', detail: 'This month', icon: 'clock', progress: null },
]

export const dashboardAchievements = [
  { label: 'First Workout', detail: 'Unlocked Jan 12', icon: 'target', unlocked: true },
  { label: '7-Day Streak', detail: '1 day to unlock', icon: 'flame', unlocked: false },
  { label: '30 Visits', detail: 'Unlocked Feb 24', icon: 'trophy', unlocked: true },
  { label: 'Early Bird', detail: 'Unlocked Mar 08', icon: 'sunrise', unlocked: true },
]

export const dashboardActivity = [
  { title: 'Checked in today', detail: 'FitOps Main Gym · 7:42 AM', icon: 'check' },
  { title: 'Membership renewed', detail: 'Elite Annual · May 12, 2025', icon: 'card' },
  { title: 'Workout completed', detail: 'Strength & Conditioning · May 10', icon: 'dumbbell' },
  { title: 'Profile updated', detail: 'Personal details · May 08, 2025', icon: 'user' },
]
