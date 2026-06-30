'use server';

import { connectPartnerSchema } from '@/shared/validators/schemas';
import * as profileService from '@/services/profile';

export async function getProfile(userId: string) {
  try {
    const data = await profileService.getUserProfile(userId);
    return { success: true as const, message: 'Profile loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getPartner(userId: string) {
  try {
    const data = await profileService.getPartner(userId);
    return { success: true as const, message: 'Partner loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function connectPartner(userId: string, input: unknown) {
  const parsed = connectPartnerSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid code', errors: parsed.error.flatten().fieldErrors };
  try {
    const result = await profileService.connectWithPartner(userId, parsed.data.coupleCode);
    return { success: result.success, message: result.success ? 'Connected!' : result.error || 'Failed', data: result.coupleId };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}
