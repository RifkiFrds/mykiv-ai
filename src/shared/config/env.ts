import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  REPLICATE_API_TOKEN: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['replicate', 'gemini', 'mock']).default('mock'),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER,
});

if (!parsed.success) {
  console.error('Environment validation failed:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  AI_PROVIDER: 'mock',
});
