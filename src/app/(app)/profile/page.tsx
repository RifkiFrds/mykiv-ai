'use client';

import { useState, useTransition } from 'react';
import { useAuth } from '@/shared/providers/auth-provider';
import { SafeArea } from '@/shared/components/layout/safe-area';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Avatar } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { updateProfile, uploadAvatar } from '@/features/profile/actions/profile';
import { linkPartner, unlinkPartner } from '@/features/couple/actions/couple';
import {
  User,
  Heart,
  Globe,
  Camera,
  Calendar,
  LogOut,
  UserMinus,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, partner, signOut, refreshProfile } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Settings form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
  const [gender, setGender] = useState<'male' | 'female' | ''>(profile?.gender || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'Asia/Jakarta');
  const [partnerEmail, setPartnerEmail] = useState('');

  // Status/feedback states
  const [profileMsg, setProfileMsg] = useState({ text: '', error: false });
  const [coupleMsg, setCoupleMsg] = useState({ text: '', error: false });
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ text: '', error: false });

    startTransition(async () => {
      const res = await updateProfile({
        fullName,
        birthDate: birthDate || null,
        gender: gender || null,
        timezone,
      });

      setProfileMsg({ text: res.message, error: !res.success });
      if (res.success) {
        refreshProfile();
      }
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    setProfileMsg({ text: '', error: false });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await uploadAvatar(base64, file.type);
        if (res.success) {
          setProfileMsg({ text: 'Avatar updated successfully.', error: false });
          refreshProfile();
        } else {
          setProfileMsg({ text: res.message || 'Avatar upload failed.', error: true });
        }
        setAvatarLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setProfileMsg({ text: 'Error reading file.', error: true });
      setAvatarLoading(false);
    }
  };

  const handleLinkPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerEmail.trim()) return;
    setCoupleMsg({ text: '', error: false });

    startTransition(async () => {
      const res = await linkPartner(partnerEmail.trim());
      setCoupleMsg({ text: res.message, error: !res.success });
      if (res.success) {
        setPartnerEmail('');
        refreshProfile();
      }
    });
  };

  const handleUnlinkPartner = () => {
    if (!confirm('Are you sure you want to unlink relationship with your partner? All couple data will remain private but unlinked.')) {
      return;
    }
    setCoupleMsg({ text: '', error: false });

    startTransition(async () => {
      const res = await unlinkPartner();
      setCoupleMsg({ text: res.message, error: !res.success });
      if (res.success) {
        refreshProfile();
      }
    });
  };

  return (
    <div className="flex-1 bg-surface min-h-dvh flex flex-col">
      <PageHeader title="Profile" />

      <SafeArea withTabBar className="px-5 pt-4 pb-10 space-y-6 stagger-children">
        {/* Profile Avatar / Photo Setup */}
        <Card variant="elevated" className="flex flex-col items-center py-6">
          <div className="relative group">
            <Avatar
              name={profile?.full_name || 'User'}
              src={profile?.avatar}
              size="xl"
              className="border-4 border-surface"
            />
            <label
              htmlFor="avatar-file"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform"
            >
              {avatarLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </label>
            <input
              id="avatar-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={avatarLoading}
            />
          </div>
          <h2 className="text-xl font-bold text-foreground mt-3">
            {profile?.full_name || 'User'}
          </h2>
          <p className="text-sm text-muted">{profile?.email}</p>
        </Card>

        {/* Edit Info Form */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-primary-500" />
            <h3 className="text-base font-bold text-foreground">Edit Profile</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Birth Date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                leftIcon={<Calendar size={16} />}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground ml-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full h-12 neu-input px-4 text-base text-foreground bg-surface border-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <Input
              label="Timezone"
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              leftIcon={<Globe size={16} />}
              required
            />

            {profileMsg.text && (
              <p
                className={`text-sm ml-1 ${
                  profileMsg.error ? 'text-danger-500' : 'text-success-500'
                }`}
              >
                {profileMsg.text}
              </p>
            )}

            <Button
              type="submit"
              size="md"
              fullWidth
              isLoading={isPending}
            >
              Save Changes
            </Button>
          </form>
        </Card>

        {/* Couple Connection Settings */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-accent-500" />
            <h3 className="text-base font-bold text-foreground">Relationship</h3>
          </div>

          {partner ? (
            /* Connected Mode */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-accent-50/50 dark:bg-accent-950/20 rounded-[var(--radius-xl)] border border-accent-100 dark:border-accent-900/30">
                <Avatar name={partner.full_name} src={partner.avatar} size="lg" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-accent-600 font-semibold uppercase tracking-wider block">
                    Linked Partner
                  </span>
                  <span className="text-base font-bold text-foreground block truncate">
                    {partner.full_name}
                  </span>
                  <span className="text-sm text-muted block truncate">
                    {partner.email}
                  </span>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              {coupleMsg.text && (
                <p className="text-sm text-danger-500 ml-1">{coupleMsg.text}</p>
              )}

              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleUnlinkPartner}
                isLoading={isPending}
                className="gap-2 text-danger-600 border-danger-100 hover:bg-danger-50"
              >
                <UserMinus size={18} />
                Unlink Partner
              </Button>
            </div>
          ) : (
            /* Unconnected Mode */
            <form onSubmit={handleLinkPartner} className="space-y-4">
              <div className="bg-primary-50 dark:bg-primary-950/20 p-3.5 rounded-[var(--radius-xl)] border border-primary-100 dark:border-primary-900/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted leading-relaxed">
                  Link with your partner to share real-time health data, log couple
                  activities, manage shared expenses, and get AI relationship insights.
                </p>
              </div>

              <Input
                label="Partner's Email"
                type="email"
                placeholder="partner@example.com"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                required
              />

              {coupleMsg.text && (
                <p
                  className={`text-sm ml-1 ${
                    coupleMsg.error ? 'text-danger-500' : 'text-success-500'
                  }`}
                >
                  {coupleMsg.text}
                </p>
              )}

              <Button
                type="submit"
                size="md"
                fullWidth
                isLoading={isPending}
                disabled={!partnerEmail.trim()}
              >
                Connect Partner
              </Button>
            </form>
          )}
        </Card>

        {/* Action Utilities (Logout) */}
        <div className="pt-2">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => signOut()}
            className="gap-2 border-neutral-300 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </SafeArea>
    </div>
  );
}
