import { z } from 'zod';

/** Base schema for health log */
export const healthLogBaseSchema = z.object({
  datetime: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
  note: z.string().nullable().optional(),
});

/** Meal logger schema */
export const mealSchema = healthLogBaseSchema.extend({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  description: z.string().min(1, 'Please enter what you ate'),
  calories: z.number().nullable().optional(),
});

/** Water logger schema */
export const waterSchema = healthLogBaseSchema.extend({
  amountMl: z.number().positive('Amount must be positive'),
});

/** Sleep logger schema */
export const sleepSchema = healthLogBaseSchema.extend({
  sleepTime: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
  wakeTime: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
  quality: z.number().min(1).max(5), // 1-5 stars
});

/** Exercise logger schema */
export const exerciseSchema = healthLogBaseSchema.extend({
  exerciseType: z.enum(['walking', 'running', 'gym', 'stretching', 'cycling']),
  durationMinutes: z.number().positive('Duration must be positive'),
});

/** Mood logger schema */
export const moodSchema = healthLogBaseSchema.extend({
  moodValue: z.enum(['happy', 'neutral', 'sad', 'stress', 'sick', 'tired']),
});

/** Medicine logger schema */
export const medicineSchema = healthLogBaseSchema.extend({
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().nullable().optional(),
  type: z.enum(['medicine', 'vitamin', 'supplement']),
});

export type MealInput = z.infer<typeof mealSchema>;
export type WaterInput = z.infer<typeof waterSchema>;
export type SleepInput = z.infer<typeof sleepSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type MoodInput = z.infer<typeof moodSchema>;
export type MedicineInput = z.infer<typeof medicineSchema>;
