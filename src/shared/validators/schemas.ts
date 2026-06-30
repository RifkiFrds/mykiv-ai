import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Name is required'),
});

export const mealLogSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  food_name: z.string().min(1, 'Food name is required'),
  calories: z.number().positive().nullable().optional(),
  protein_g: z.number().positive().nullable().optional(),
  carbs_g: z.number().positive().nullable().optional(),
  fat_g: z.number().positive().nullable().optional(),
});

export const waterLogSchema = z.object({
  amount_ml: z.number().positive('Amount must be positive'),
});

export const sleepLogSchema = z.object({
  sleep_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  duration_minutes: z.number().positive().nullable().optional(),
  quality_score: z.number().min(1).max(10).nullable().optional(),
  bed_time: z.string().datetime().nullable().optional(),
  wake_time: z.string().datetime().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const exerciseLogSchema = z.object({
  exercise_type: z.string().min(1, 'Exercise type is required'),
  duration_minutes: z.number().positive().nullable().optional(),
  calories_burned: z.number().positive().nullable().optional(),
  intensity: z.enum(['low', 'moderate', 'high']).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const moodLogSchema = z.object({
  mood_score: z.number().min(1).max(10),
  mood_label: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const medicineLogSchema = z.object({
  medicine_name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().nullable().optional(),
  status: z.enum(['taken', 'skipped', 'missed']),
  notes: z.string().max(500).nullable().optional(),
});

export const activitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).nullable().optional(),
  category: z.enum(['date', 'travel', 'fitness', 'cooking', 'movie', 'other']),
  activity_date: z.string().datetime().nullable().optional(),
});

export const wishlistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).nullable().optional(),
  category: z.enum(['experience', 'item', 'travel', 'food', 'other']),
  estimated_cost: z.number().positive().nullable().optional(),
  priority: z.number().min(1).max(5).nullable().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['food', 'travel', 'entertainment', 'bills', 'shopping', 'health', 'other']),
  split_type: z.enum(['equal', 'percentage', 'custom']),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).nullable().optional(),
  category: z.enum(['medicine', 'water', 'exercise', 'meal', 'sleep', 'custom']),
  reminder_time: z.string().datetime(),
  repeat_type: z.enum(['none', 'daily', 'weekly', 'monthly']),
});

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  userId: z.string().uuid(),
});

export const connectPartnerSchema = z.object({
  coupleCode: z.string().length(6, 'Couple code must be 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MealLogInput = z.infer<typeof mealLogSchema>;
export type WaterLogInput = z.infer<typeof waterLogSchema>;
export type SleepLogInput = z.infer<typeof sleepLogSchema>;
export type ExerciseLogInput = z.infer<typeof exerciseLogSchema>;
export type MoodLogInput = z.infer<typeof moodLogSchema>;
export type MedicineLogInput = z.infer<typeof medicineLogSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type WishlistInput = z.infer<typeof wishlistSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type AIChatInput = z.infer<typeof aiChatSchema>;
