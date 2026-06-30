import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  birthDate: z.string().nullable().optional(),
  gender: z.enum(['male', 'female']).nullable().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
