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
  privacy_settings: PrivacySettings;
  created_at: string;
  updated_at: string;
}

export interface PrivacySettings {
  share_meals: boolean;
  share_exercise: boolean;
  share_sleep: boolean;
  share_mood: boolean;
  share_medicine: boolean;
}

export interface Couple {
  id: string;
  partner_a: string;
  partner_b: string;
  anniversary_date: string | null;
  relationship_status: string;
  created_at: string;
}

export type HealthLogType = 'meal' | 'water' | 'sleep' | 'exercise' | 'medicine' | 'mood';

export interface HealthLog {
  id: string;
  user_id: string;
  type: HealthLogType;
  value: string | number | null;
  unit: string | null;
  datetime: string;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
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

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: 'medicine' | 'water' | 'exercise' | 'meal' | 'sleep' | 'custom';
  reminder_time: string;
  repeat_type: 'none' | 'daily' | 'weekly' | 'monthly';
  ai_generated: boolean;
  status: 'active' | 'completed' | 'snoozed';
  created_at: string;
}

export interface CoupleActivity {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  description: string | null;
  category: 'date' | 'travel' | 'fitness' | 'cooking' | 'movie' | 'other';
  activity_date: string | null;
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

export interface AIMemory {
  id: string;
  couple_id: string | null;
  category: string;
  title: string;
  content: string;
  importance: number;
  source: string | null;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  token_usage: number | null;
  latency: number | null;
  created_at: string;
}

export interface AIReport {
  id: string;
  user_id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'relationship';
  period: string;
  summary: string;
  recommendation: string[];
  generated_at: string;
}

export interface AIContext {
  user: Profile | null;
  partner: Profile | null;
  health: HealthContext;
  couple: CoupleContext;
  memory: AIMemory[];
  recentConversations: AIConversation[];
}

export interface HealthContext {
  meals: MealLog[];
  water: WaterLog[];
  sleep: SleepLog[];
  exercise: ExerciseLog[];
  mood: MoodLog[];
  medicine: MedicineLog[];
}

export interface CoupleContext {
  activities: CoupleActivity[];
  wishlist: WishlistItem[];
  expenses: Expense[];
}

export interface AIResponse {
  summary: string;
  recommendation: string[];
  prediction: string[];
  warning: string[];
  confidence: number;
  reasoning: string[];
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string }[];
}

export type ApiResponse<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; errors: string[] };
