'use server';

import * as healthRepo from '@/repositories/health';
import { MealLogInput, WaterLogInput, SleepLogInput, ExerciseLogInput, MoodLogInput, MedicineLogInput } from '@/shared/validators/schemas';
import { MealLog, WaterLog, SleepLog, ExerciseLog, MoodLog, MedicineLog } from '@/types';

export async function getMeals(userId: string): Promise<MealLog[]> {
  return healthRepo.getMealLogs(userId);
}

export async function logMeal(userId: string, input: MealLogInput): Promise<MealLog | null> {
  return healthRepo.createMealLog(userId, input);
}

export async function getWater(userId: string, from?: string): Promise<WaterLog[]> {
  return healthRepo.getWaterLogs(userId, from);
}

export async function logWater(userId: string, input: WaterLogInput): Promise<WaterLog | null> {
  return healthRepo.createWaterLog(userId, input.amount_ml);
}

export async function getSleep(userId: string): Promise<SleepLog[]> {
  return healthRepo.getSleepLogs(userId);
}

export async function logSleep(userId: string, input: SleepLogInput): Promise<SleepLog | null> {
  return healthRepo.createSleepLog(userId, input);
}

export async function getExercise(userId: string): Promise<ExerciseLog[]> {
  return healthRepo.getExerciseLogs(userId);
}

export async function logExercise(userId: string, input: ExerciseLogInput): Promise<ExerciseLog | null> {
  return healthRepo.createExerciseLog(userId, input);
}

export async function getMood(userId: string): Promise<MoodLog[]> {
  return healthRepo.getMoodLogs(userId);
}

export async function logMood(userId: string, input: MoodLogInput): Promise<MoodLog | null> {
  return healthRepo.createMoodLog(userId, input);
}

export async function getMedicine(userId: string): Promise<MedicineLog[]> {
  return healthRepo.getMedicineLogs(userId);
}

export async function logMedicine(userId: string, input: MedicineLogInput): Promise<MedicineLog | null> {
  return healthRepo.createMedicineLog(userId, input);
}

export async function getTodayWaterTotal(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const logs = await healthRepo.getWaterLogs(userId, today);
  return logs.reduce((sum, log) => sum + (log.amount_ml || 0), 0);
}
