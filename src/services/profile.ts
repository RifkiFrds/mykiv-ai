'use server';

import * as profileRepo from '@/repositories/profile';
import { Profile } from '@/types';

export async function getUserProfile(userId: string): Promise<Profile | null> {
  return profileRepo.getProfile(userId);
}

export async function getPartner(userId: string): Promise<Profile | null> {
  const profile = await profileRepo.getProfile(userId);
  if (!profile?.partner_id) return null;
  return profileRepo.getPartnerProfile(profile.partner_id);
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  return profileRepo.updateProfile(userId, updates);
}

export async function connectWithPartner(userId: string, coupleCode: string) {
  return profileRepo.connectPartners(userId, coupleCode);
}
