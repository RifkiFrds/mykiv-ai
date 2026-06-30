'use server';

import {
  mealLogSchema, waterLogSchema, sleepLogSchema, exerciseLogSchema, moodLogSchema, medicineLogSchema,
  MealLogInput, WaterLogInput, SleepLogInput, ExerciseLogInput, MoodLogInput, MedicineLogInput,
} from '@/shared/validators/schemas';
import * as healthService from '@/services/health';

export async function getMeals(userId: string) {
  try {
    const data = await healthService.getMeals(userId);
    return { success: true as const, message: 'Meals loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function createMeal(userId: string, input: unknown) {
  const parsed = mealLogSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  try {
    const data = await healthService.logMeal(userId, parsed.data);
    return { success: true as const, message: 'Meal logged', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getWater(userId: string, from?: string) {
  try {
    const data = await healthService.getWater(userId, from);
    return { success: true as const, message: 'Water loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function createWater(userId: string, input: unknown) {
  const parsed = waterLogSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  try {
    const data = await healthService.logWater(userId, parsed.data);
    return { success: true as const, message: 'Water logged', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getSleep(userId: string) {
  try {
    const data = await healthService.getSleep(userId);
    return { success: true as const, message: 'Sleep loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function createSleep(userId: string, input: unknown) {
  const parsed = sleepLogSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  try {
    const data = await healthService.logSleep(userId, parsed.data);
    return { success: true as const, message: 'Sleep logged', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getExercise(userId: string) {
  try {
    const data = await healthService.getExercise(userId);
    return { success: true as const, message: 'Exercise loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function createExercise(userId: string, input: unknown) {
  const parsed = exerciseLogSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  try {
    const data = await healthService.logExercise(userId, parsed.data);
    return { success: true as const, message: 'Exercise logged', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getMood(userId: string) {
  try {
    const data = await healthService.getMood(userId);
    return { success: true as const, message: 'Mood loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function createMood(userId: string, input: unknown) {
  const parsed = moodLogSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  try {
    const data = await healthService.logMood(userId, parsed.data);
    return { success: true as const, message: 'Mood logged', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getMedicine(userId: string) {
  try {
    const data = await healthService.getMedicine(userId);
    return { success: true as const, message: 'Medicine loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function createMedicine(userId: string, input: unknown) {
  const parsed = medicineLogSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  try {
    const data = await healthService.logMedicine(userId, parsed.data);
    return { success: true as const, message: 'Medicine logged', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}
