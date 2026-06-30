import { z } from 'zod';

export const activitySchema = z.object({
  category: z.enum(['date', 'travel', 'movie', 'dinner', 'sport', 'game', 'celebration', 'other']),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().nullable().optional(),
  activityDate: z.string().or(z.date()).transform((val) => new Date(val).toISOString().split('T')[0]),
});

export const wishlistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  category: z.enum(['travel', 'gift', 'experience', 'food', 'shopping', 'other']),
  progress: z.number().min(0).max(100),
  completed: z.boolean().default(false),
});

export const expenseSchema = z.object({
  category: z.enum(['food', 'transportation', 'shopping', 'gift', 'vacation', 'bills', 'other']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  expenseDate: z.string().or(z.date()).transform((val) => new Date(val).toISOString().split('T')[0]),
});

export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().nullable().optional(),
});

export type ActivityInput = z.infer<typeof activitySchema>;
export type WishlistInput = z.infer<typeof wishlistSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
