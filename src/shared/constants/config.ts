/** App-wide configuration constants */
export const APP_CONFIG = {
  name: 'MyKiv AI',
  shortName: 'MyKiv',
  description: 'AI Relationship & Health Companion',
  version: '0.1.0',
  defaultTimezone: 'Asia/Jakarta',
  defaultLocale: 'id-ID',

  /** Health defaults */
  health: {
    waterDailyTarget: 2000, // ml
    sleepRecommendedHours: 8,
    mealTimesDefault: {
      breakfast: '07:00',
      lunch: '12:00',
      dinner: '19:00',
    },
  },

  /** AI configuration */
  ai: {
    maxContextTokens: 8000,
    maxResponseTokens: 2000,
    temperature: 0.7,
    /** Context priority weights per 04_AI_ARCHITECTURE §6 */
    contextPriority: {
      health: 0.4,
      relationship: 0.25,
      reminder: 0.1,
      memory: 0.1,
      calendar: 0.05,
      expense: 0.05,
      location: 0.05,
    },
  },

  /** Pagination defaults */
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },

  /** Storage buckets per 02_DATABASE §8 */
  storage: {
    avatars: 'avatars',
    healthImages: 'health-images',
    photos: 'photos',
    attachments: 'attachments',
  },
} as const;
