'use server';

import { supabase } from './supabase';
import { Profile } from '@/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function getPartnerProfile(partnerId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', partnerId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function connectPartners(userId: string, partnerCode: string) {
  const { data: partner } = await supabase
    .from('profiles')
    .select('id, couple_id')
    .eq('couple_code', partnerCode.toUpperCase())
    .neq('id', userId)
    .maybeSingle();

  if (!partner) return { success: false, error: 'Invalid couple code' };

  const coupleId = partner.couple_id || `couple_${Math.random().toString(36).substring(2, 10)}`;

  await supabase.from('profiles').update({ partner_id: partner.id, couple_id: coupleId }).eq('id', userId);
  await supabase.from('profiles').update({ partner_id: userId, couple_id: coupleId }).eq('id', partner.id);

  return { success: true, coupleId };
}
