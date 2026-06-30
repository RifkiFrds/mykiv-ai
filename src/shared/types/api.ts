/** Standard API response wrapper per 03_API_SPEC */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/** Standard API error response */
export interface ApiError {
  success: false;
  message: string;
  errors: string[];
}

/** Pagination parameters per 03_API_SPEC query params */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  from?: string;
  to?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** AI output format per 04_AI_ARCHITECTURE §10 */
export interface AiOutput {
  summary: string;
  recommendation: string[];
  prediction: string[];
  warning: string[];
  confidence: number;
  reasoning: string[];
}

/** Dashboard response per 03_API_SPEC */
export interface DashboardData {
  todaySummary: {
    meals: number;
    water: number;
    sleepHours: number;
    exercise: number;
    mood: string | null;
    medicines: number;
  };
  partnerSummary: {
    meals: number;
    water: number;
    sleepHours: number;
    mood: string | null;
  };
  aiRecommendation: AiOutput | null;
  upcomingReminders: Array<{
    id: string;
    title: string;
    category: string;
    reminderTime: string;
  }>;
  healthScore: number;
  relationshipScore: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }>;
}
