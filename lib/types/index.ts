export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  gender: 'male' | 'female' | 'other' | null;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  partner_id: string | null;
  couple_id: string | null;
  couple_code: string | null;
  privacy_settings: {
    share_meals: boolean;
    share_exercise: boolean;
    share_sleep: boolean;
    share_mood: boolean;
    share_medicine: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface MealLog {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  photo_url: string | null;
  logged_at: string;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  sleep_date: string;
  duration_minutes: number | null;
  quality_score: number | null;
  bed_time: string | null;
  wake_time: string | null;
  notes: string | null;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_type: string;
  duration_minutes: number | null;
  calories_burned: number | null;
  intensity: 'low' | 'moderate' | 'high' | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  mood_score: number | null;
  mood_label: string | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export interface MedicineLog {
  id: string;
  user_id: string;
  medicine_name: string;
  dosage: string | null;
  taken_at: string;
  status: 'taken' | 'skipped' | 'missed';
  notes: string | null;
  created_at: string;
}

export interface CoupleActivity {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  description: string | null;
  activity_type: 'date' | 'travel' | 'fitness' | 'cooking' | 'movie' | 'other';
  scheduled_at: string | null;
  status: 'planned' | 'completed' | 'cancelled';
  created_at: string;
}

export interface WishlistItem {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  description: string | null;
  category: 'experience' | 'item' | 'travel' | 'food' | 'other';
  estimated_cost: number | null;
  priority: number | null;
  is_fulfilled: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  amount: number;
  category: 'food' | 'travel' | 'entertainment' | 'bills' | 'shopping' | 'health' | 'other';
  split_type: 'equal' | 'percentage' | 'custom';
  paid_by: string | null;
  expense_date: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_type: 'medicine' | 'water' | 'exercise' | 'meal' | 'sleep' | 'custom';
  scheduled_at: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  created_at: string;
}

export interface AIMemory {
  id: string;
  user_id: string;
  memory_type: 'preference' | 'fact' | 'goal' | 'insight';
  content: string;
  category: string | null;
  confidence: number;
  source: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIReport {
  id: string;
  user_id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'relationship';
  title: string;
  summary: string | null;
  content: Record<string, unknown> | null;
  generated_at: string;
  is_read: boolean;
}

export interface AIConversation {
  id: string;
  user_id: string;
  message: string;
  role: 'user' | 'assistant' | 'system';
  context: Record<string, unknown> | null;
  created_at: string;
}
