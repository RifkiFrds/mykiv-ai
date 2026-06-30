import { z } from 'zod';

export const reminderSchema = z.object({
  category: z.enum([
    'meal',
    'water',
    'medicine',
    'sleep',
    'exercise',
    'couple_activity',
    'wishlist',
    'anniversary',
    'expense',
    'custom',
  ]),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().nullable().optional(),
  reminderTime: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
  repeatType: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']),
});

export type ReminderInput = z.infer<typeof reminderSchema>;
export type ReminderCategory = ReminderInput['category'];
export type RepeatType = ReminderInput['repeatType'];
