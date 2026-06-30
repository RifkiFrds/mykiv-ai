'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, LogOut, User, Heart, Settings } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coupleCodeInput, setCoupleCodeInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    if (data) {
      setProfile(data as Profile);
      if (data.partner_id) {
        const { data: partnerData } = await supabase.from('profiles').select('*').eq('id', data.partner_id).maybeSingle();
        if (partnerData) setPartner(partnerData as Profile);
      }
    }
    setLoading(false);
  };

  const updatePrivacy = async (key: string, value: boolean) => {
    if (!profile) return;
    setSaving(true);
    const updated = { ...profile.privacy_settings, [key]: value };
    await supabase.from('profiles').update({ privacy_settings: updated }).eq('id', profile.id);
    setProfile({ ...profile, privacy_settings: updated });
    setSaving(false);
  };

  const connectPartner = async () => {
    if (!coupleCodeInput || !profile) return;
    const { data: partnerProfile } = await supabase.from('profiles').select('*').eq('couple_code', coupleCodeInput.toUpperCase()).maybeSingle();
    if (partnerProfile && partnerProfile.id !== profile.id) {
      const coupleId = `couple_${Math.random().toString(36).substring(2, 10)}`;
      await supabase.from('profiles').update({ partner_id: partnerProfile.id, couple_id: coupleId }).eq('id', profile.id);
      await supabase.from('profiles').update({ partner_id: profile.id, couple_id: coupleId }).eq('id', partnerProfile.id);
      setPartner(partnerProfile as Profile);
      setProfile({ ...profile, partner_id: partnerProfile.id, couple_id: coupleId });
      setCoupleCodeInput('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-neutral-900">Profile</h1>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-neutral-200">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-neutral-500">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-neutral-900">{profile?.full_name}</p>
          <p className="text-sm text-neutral-500">{profile?.email}</p>
        </div>
      </div>

      <Card className="rounded-2xl border-0 p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <Heart className="h-4 w-4 text-rose-500" /> Partner
        </h2>
        {partner ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200">
              {partner.avatar_url ? (
                <img src={partner.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-500">
                  {partner.full_name?.charAt(0) || 'P'}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{partner.full_name}</p>
              <p className="text-xs text-neutral-500">Connected</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">Your couple code: <span className="font-mono font-bold text-teal-600">{profile?.couple_code}</span></p>
            <div className="flex gap-2">
              <Input
                value={coupleCodeInput}
                onChange={(e) => setCoupleCodeInput(e.target.value)}
                placeholder="Enter partner's code"
                className="h-12 rounded-xl"
              />
              <Button onClick={connectPartner} className="h-12 rounded-xl bg-teal-600 hover:bg-teal-700">Connect</Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="rounded-2xl border-0 p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <Settings className="h-4 w-4 text-neutral-500" /> Privacy Settings
        </h2>
        <div className="space-y-4">
          {[
            { key: 'share_meals', label: 'Share meal logs' },
            { key: 'share_exercise', label: 'Share exercise logs' },
            { key: 'share_sleep', label: 'Share sleep logs' },
            { key: 'share_mood', label: 'Share mood logs' },
            { key: 'share_medicine', label: 'Share medicine logs' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">{setting.label}</span>
              <Switch
                checked={profile?.privacy_settings?.[setting.key as keyof typeof profile.privacy_settings] || false}
                onCheckedChange={(checked) => updatePrivacy(setting.key, checked)}
                disabled={saving}
              />
            </div>
          ))}
        </div>
      </Card>

      <Button
        variant="outline"
        onClick={handleSignOut}
        className="h-12 w-full rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
