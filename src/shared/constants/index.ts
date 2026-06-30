export const APP_NAME = 'MyKiv AI';
export const APP_VERSION = '1.0.0';

export const HEALTH_GOALS = {
  waterDaily: 2500,
  sleepMin: 420,
  exerciseWeekly: 150,
  moodCheckDaily: true,
} as const;

export const AI_CONTEXT_PRIORITY = {
  health: 0.40,
  relationship: 0.25,
  reminder: 0.10,
  memory: 0.10,
  calendar: 0.05,
  expense: 0.05,
  location: 0.05,
} as const;

export const MOOD_LABELS: Record<number, string> = {
  1: 'Terrible', 2: 'Bad', 3: 'Not Good', 4: 'Okay', 5: 'Fine',
  6: 'Good', 7: 'Pretty Good', 8: 'Great', 9: 'Excellent', 10: 'Amazing',
};

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export const EXERCISE_TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Yoga', 'Gym', 'HIIT', 'Pilates', 'Stretching', 'Boxing'] as const;
export const EXPENSE_CATEGORIES = ['food', 'travel', 'entertainment', 'bills', 'shopping', 'health', 'other'] as const;
export const ACTIVITY_TYPES = ['date', 'travel', 'fitness', 'cooking', 'movie', 'other'] as const;
export const WISHLIST_CATEGORIES = ['experience', 'item', 'travel', 'food', 'other'] as const;

export const PWA_CONFIG = {
  cacheName: 'mykiv-cache-v1',
  offlinePage: '/offline',
  assets: ['/', '/dashboard', '/login', '/register'],
} as const;
