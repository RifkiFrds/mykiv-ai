/** Route path constants — single source of truth for navigation */
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',

  // App
  DASHBOARD: '/',
  HEALTH: '/health',
  MEAL: '/health/meal',
  WATER: '/health/water',
  SLEEP: '/health/sleep',
  EXERCISE: '/health/exercise',
  MOOD: '/health/mood',
  MEDICINE: '/health/medicine',

  // AI
  AI_CHAT: '/ai',

  // Couple
  COUPLE: '/couple',
  ACTIVITY: '/couple/activity',
  WISHLIST: '/couple/wishlist',
  ANNIVERSARY: '/couple/anniversary',
  PHOTO: '/couple/photo',
  MEMORY: '/couple/memory',

  // Finance
  EXPENSE: '/finance',

  // Reminder
  REMINDER: '/reminder',

  // Presence
  LOCATION: '/presence',

  // Reports
  REPORT_DAILY: '/report/daily',
  REPORT_WEEKLY: '/report/weekly',
  REPORT_MONTHLY: '/report/monthly',

  // Profile
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/** API route prefix */
export const API_PREFIX = '/api/v1' as const;

/** Navigation tabs for bottom tab bar */
export const TAB_ITEMS = [
  { label: 'Home', href: ROUTES.DASHBOARD, icon: 'home' as const },
  { label: 'Health', href: ROUTES.HEALTH, icon: 'heart' as const },
  { label: 'AI', href: ROUTES.AI_CHAT, icon: 'sparkles' as const },
  { label: 'Couple', href: ROUTES.COUPLE, icon: 'users' as const },
  { label: 'Profile', href: ROUTES.PROFILE, icon: 'user' as const },
] as const;
