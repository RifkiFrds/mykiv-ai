/* ==============================================
   MyKiv AI — Supabase Database Types
   Auto-generated types for all tables defined in
   02_DATABASE.md. Keep in sync with Supabase.
   ============================================== */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Health log types */
export type HealthLogType = 'meal' | 'water' | 'sleep' | 'exercise' | 'medicine' | 'mood';

/** Meal sub-types */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/** Exercise sub-types */
export type ExerciseType = 'walking' | 'running' | 'gym' | 'stretching' | 'cycling';

/** Mood values */
export type MoodValue = 'happy' | 'neutral' | 'sad' | 'stress' | 'sick' | 'tired';

/** Medicine types */
export type MedicineType = 'medicine' | 'vitamin' | 'supplement';

/** Reminder categories */
export type ReminderCategory =
  | 'meal'
  | 'water'
  | 'medicine'
  | 'sleep'
  | 'exercise'
  | 'couple_activity'
  | 'wishlist'
  | 'anniversary'
  | 'expense'
  | 'custom';

/** Reminder repeat types */
export type RepeatType = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

/** Reminder status */
export type ReminderStatus = 'active' | 'completed' | 'snoozed' | 'cancelled';

/** AI Memory categories */
export type AiMemoryCategory =
  | 'favorite_food'
  | 'favorite_drink'
  | 'favorite_place'
  | 'favorite_color'
  | 'important_date'
  | 'gift'
  | 'habit'
  | 'goal'
  | 'personality'
  | 'preference';

/** AI Report types */
export type AiReportType = 'daily' | 'weekly' | 'monthly';

/** Expense categories */
export type ExpenseCategory =
  | 'food'
  | 'transportation'
  | 'shopping'
  | 'gift'
  | 'vacation'
  | 'bills'
  | 'other';

/** Relationship status */
export type RelationshipStatus = 'active' | 'paused';

/** Gender */
export type Gender = 'male' | 'female';

/** AI Memory importance level */
export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';

/** AI Memory source */
export type MemorySource = 'user' | 'ai' | 'system';

/** Couple activity categories */
export type ActivityCategory =
  | 'date'
  | 'travel'
  | 'movie'
  | 'dinner'
  | 'sport'
  | 'game'
  | 'celebration'
  | 'other';

/** Wishlist categories */
export type WishlistCategory =
  | 'travel'
  | 'gift'
  | 'experience'
  | 'food'
  | 'shopping'
  | 'other';

// ────────────────────────────────────────────────
// Table Row Types
// ────────────────────────────────────────────────

export interface UserRow {
  id: string;
  couple_id: string | null;
  full_name: string;
  email: string;
  avatar: string | null;
  birth_date: string | null;
  gender: Gender | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface CoupleRow {
  id: string;
  partner_a: string;
  partner_b: string;
  anniversary_date: string | null;
  relationship_status: RelationshipStatus;
  created_at: string;
}

export interface HealthLogRow {
  id: string;
  user_id: string;
  type: HealthLogType;
  value: Json;
  unit: string | null;
  datetime: string;
  note: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface MedicineRow {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  type: MedicineType;
  schedule: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderRow {
  id: string;
  user_id: string;
  category: ReminderCategory;
  title: string;
  description: string | null;
  reminder_time: string;
  repeat_type: RepeatType;
  ai_generated: boolean;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ReminderLogRow {
  id: string;
  reminder_id: string;
  sent_at: string;
  opened_at: string | null;
  completed: boolean;
}

export interface AiMemoryRow {
  id: string;
  couple_id: string;
  user_id: string | null;
  category: AiMemoryCategory;
  title: string;
  content: string;
  importance: ImportanceLevel;
  source: MemorySource;
  created_at: string;
  updated_at: string;
}

export interface AiConversationRow {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  token_usage: number | null;
  latency: number | null;
  created_at: string;
}

export interface AiReportRow {
  id: string;
  user_id: string;
  type: AiReportType;
  period: string;
  summary: string;
  recommendation: string | null;
  generated_at: string;
}

export interface CoupleActivityRow {
  id: string;
  couple_id: string;
  category: ActivityCategory;
  title: string;
  description: string | null;
  activity_date: string;
  created_at: string;
  deleted_at: string | null;
}

export interface AnniversaryRow {
  id: string;
  couple_id: string;
  title: string;
  event_date: string;
  reminder_before: number;
  created_at: string;
}

export interface WishlistRow {
  id: string;
  couple_id: string;
  title: string;
  category: WishlistCategory;
  progress: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRow {
  id: string;
  couple_id: string;
  user_id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
  deleted_at: string | null;
}

export interface LocationRow {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  recorded_at: string;
}

export interface PhotoRow {
  id: string;
  couple_id: string;
  storage_path: string;
  caption: string | null;
  taken_at: string | null;
  created_at: string;
}

// ────────────────────────────────────────────────
// Database type map (for Supabase client typing)
// ────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserRow, 'id' | 'created_at'>>;
      };
      couples: {
        Row: CoupleRow;
        Insert: Omit<CoupleRow, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<CoupleRow, 'id' | 'created_at'>>;
      };
      health_logs: {
        Row: HealthLogRow;
        Insert: Omit<HealthLogRow, 'id' | 'created_at' | 'deleted_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<HealthLogRow, 'id' | 'created_at'>>;
      };
      medicines: {
        Row: MedicineRow;
        Insert: Omit<MedicineRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MedicineRow, 'id' | 'created_at'>>;
      };
      reminders: {
        Row: ReminderRow;
        Insert: Omit<ReminderRow, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ReminderRow, 'id' | 'created_at'>>;
      };
      reminder_logs: {
        Row: ReminderLogRow;
        Insert: Omit<ReminderLogRow, 'id'> & { id?: string };
        Update: Partial<Omit<ReminderLogRow, 'id'>>;
      };
      ai_memory: {
        Row: AiMemoryRow;
        Insert: Omit<AiMemoryRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AiMemoryRow, 'id' | 'created_at'>>;
      };
      ai_conversations: {
        Row: AiConversationRow;
        Insert: Omit<AiConversationRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AiConversationRow, 'id' | 'created_at'>>;
      };
      ai_reports: {
        Row: AiReportRow;
        Insert: Omit<AiReportRow, 'id' | 'generated_at'> & {
          id?: string;
          generated_at?: string;
        };
        Update: Partial<Omit<AiReportRow, 'id' | 'generated_at'>>;
      };
      couple_activities: {
        Row: CoupleActivityRow;
        Insert: Omit<CoupleActivityRow, 'id' | 'created_at' | 'deleted_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CoupleActivityRow, 'id' | 'created_at'>>;
      };
      anniversaries: {
        Row: AnniversaryRow;
        Insert: Omit<AnniversaryRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AnniversaryRow, 'id' | 'created_at'>>;
      };
      wishlists: {
        Row: WishlistRow;
        Insert: Omit<WishlistRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<WishlistRow, 'id' | 'created_at'>>;
      };
      expenses: {
        Row: ExpenseRow;
        Insert: Omit<ExpenseRow, 'id' | 'created_at' | 'deleted_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ExpenseRow, 'id' | 'created_at'>>;
      };
      locations: {
        Row: LocationRow;
        Insert: Omit<LocationRow, 'id'> & { id?: string };
        Update: Partial<Omit<LocationRow, 'id'>>;
      };
      photos: {
        Row: PhotoRow;
        Insert: Omit<PhotoRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PhotoRow, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      health_log_type: HealthLogType;
      meal_type: MealType;
      exercise_type: ExerciseType;
      mood_value: MoodValue;
      medicine_type: MedicineType;
      reminder_category: ReminderCategory;
      repeat_type: RepeatType;
      reminder_status: ReminderStatus;
      ai_memory_category: AiMemoryCategory;
      ai_report_type: AiReportType;
      expense_category: ExpenseCategory;
      relationship_status: RelationshipStatus;
      gender: Gender;
      importance_level: ImportanceLevel;
      memory_source: MemorySource;
      activity_category: ActivityCategory;
      wishlist_category: WishlistCategory;
    };
  };
}
