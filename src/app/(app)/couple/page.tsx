'use client';

import { useState, useEffect, useTransition } from 'react';
import { SafeArea } from '@/shared/components/layout/safe-area';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { BottomSheet } from '@/shared/components/ui/bottom-sheet';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/shared/providers/auth-provider';
import {
  createActivity,
  getActivities,
  deleteActivity,
} from '@/features/couple/actions/activities';
import {
  createWishlist,
  getWishlists,
  updateWishlistProgress,
  deleteWishlist,
} from '@/features/couple/actions/wishlist';
import {
  updateLocation,
  getPartnerLocation,
} from '@/features/couple/actions/presence';
import type {
  CoupleActivityRow,
  WishlistRow,
  ActivityCategory,
  WishlistCategory,
} from '@/shared/types/database';
import {
  Heart,
  MapPin,
  Compass,
  Gift,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Plane,
  Camera,
  Activity,
  CheckCircle,
} from 'lucide-react';

const ACTIVITY_CATEGORIES: Record<ActivityCategory, string> = {
  date: '❤️ Date',
  travel: '✈️ Travel',
  movie: '🎬 Movie',
  dinner: '🍽️ Dinner',
  sport: '⚽ Sport',
  game: '🎮 Game',
  celebration: '🎉 Celebration',
  other: '✨ Other',
};

const WISHLIST_CATEGORIES: Record<WishlistCategory, string> = {
  travel: '✈️ Travel',
  gift: '🎁 Gift',
  experience: '🎪 Experience',
  food: '🍕 Food',
  shopping: '🛍️ Shopping',
  other: '✨ Other',
};

export default function CouplePage() {
  const { partner } = useAuth();
  const [activeTab, setActiveTab] = useState<'timeline' | 'wishlist' | 'presence'>('timeline');
  const [activities, setActivities] = useState<CoupleActivityRow[]>([]);
  const [wishlists, setWishlists] = useState<WishlistRow[]>([]);
  const [partnerCoords, setPartnerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Activity form states
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actCategory, setActCategory] = useState<ActivityCategory>('date');
  const [actDate, setActDate] = useState('');

  // Wishlist form states
  const [wishTitle, setWishTitle] = useState('');
  const [wishCategory, setWishCategory] = useState<WishlistCategory>('gift');
  const [wishProgress, setWishProgress] = useState(0);

  // Load functions
  const loadActivities = async () => {
    const res = await getActivities();
    if (res.success && res.data) setActivities(res.data);
  };

  const loadWishlists = async () => {
    const res = await getWishlists();
    if (res.success && res.data) setWishlists(res.data);
  };

  const loadPresence = async () => {
    const res = await getPartnerLocation();
    if (res.success && res.data) {
      const loc = res.data as any;
      setPartnerCoords({ lat: loc.latitude, lng: loc.longitude });
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'timeline') loadActivities().finally(() => setLoading(false));
    else if (activeTab === 'wishlist') loadWishlists().finally(() => setLoading(false));
    else if (activeTab === 'presence') loadPresence().finally(() => setLoading(false));
  }, [activeTab]);

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await updateLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy || null,
      });

      if (res.success) {
        alert('Live location coordinates updated successfully!');
        loadPresence();
      } else {
        alert('Failed to update location.');
      }
    });
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actDate) return;

    startTransition(async () => {
      const res = await createActivity({
        category: actCategory,
        title: actTitle.trim(),
        description: actDesc.trim() || null,
        activityDate: actDate,
      });

      if (res.success) {
        setActTitle('');
        setActDesc('');
        setActiveSheet(null);
        loadActivities();
      }
    });
  };

  const handleAddWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishTitle.trim()) return;

    startTransition(async () => {
      const res = await createWishlist({
        title: wishTitle.trim(),
        category: wishCategory,
        progress: wishProgress,
        completed: wishProgress >= 100,
      });

      if (res.success) {
        setWishTitle('');
        setWishProgress(0);
        setActiveSheet(null);
        loadWishlists();
      }
    });
  };

  const handleUpdateWishProgress = (id: string, progress: number) => {
    startTransition(async () => {
      const res = await updateWishlistProgress(id, progress);
      if (res.success) loadWishlists();
    });
  };

  const handleDeleteActivity = (id: string) => {
    if (!confirm('Delete activity log?')) return;
    startTransition(async () => {
      const res = await deleteActivity(id);
      if (res.success) loadActivities();
    });
  };

  const handleDeleteWishlist = (id: string) => {
    if (!confirm('Delete wishlist item?')) return;
    startTransition(async () => {
      const res = await deleteWishlist(id);
      if (res.success) loadWishlists();
    });
  };

  if (!partner) {
    return (
      <div className="flex-1 bg-surface min-h-dvh flex flex-col justify-center items-center p-6 text-center">
        <Heart className="w-16 h-16 text-muted opacity-30 mb-4 animate-pulse-soft" />
        <h2 className="text-xl font-bold text-foreground">Couple Hub</h2>
        <p className="text-sm text-muted mt-2 max-w-[280px]">
          Please connect with a partner via your Profile screen first to access shared timelines, wishlists, and locations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-surface min-h-dvh flex flex-col">
      <PageHeader title="Couple Hub" />

      {/* Tabs Selector Header */}
      <div className="bg-surface-elevated/50 border-b border-border sticky top-14 z-20">
        <div className="flex max-w-lg mx-auto h-12 px-3 justify-around items-center">
          {(['timeline', 'wishlist', 'presence'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold h-full px-4 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {tab === 'timeline' && <Calendar size={16} />}
              {tab === 'wishlist' && <Gift size={16} />}
              {tab === 'presence' && <MapPin size={16} />}
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <SafeArea withTabBar className="px-5 pt-4 pb-10 space-y-6 stagger-children">
        {/* Timeline View */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                Our Activities Timeline
              </h3>
              <Button size="sm" variant="primary" className="rounded-full h-8 w-8 p-0" onClick={() => setActiveSheet('activity')}>
                <Plus size={18} />
              </Button>
            </div>

            {loading ? (
              <Card variant="elevated" className="h-16 animate-pulse-soft" />
            ) : activities.length === 0 ? (
              <div className="text-center py-10 text-muted">
                <Heart size={32} className="mx-auto opacity-30 mb-2" />
                <p className="text-sm">No activity logs recorded yet.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-primary-200 ml-4 pl-6 space-y-5">
                {activities.map((act) => (
                  <div key={act.id} className="relative">
                    {/* Circle timeline dot */}
                    <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-primary-500 border-4 border-surface shadow-sm" />
                    <Card variant="elevated" padding="md">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="primary" className="mb-1 text-[10px]">
                            {ACTIVITY_CATEGORIES[act.category]}
                          </Badge>
                          <h4 className="text-sm font-bold text-foreground">{act.title}</h4>
                          {act.description && (
                            <p className="text-xs text-muted mt-1 leading-relaxed">{act.description}</p>
                          )}
                          <span className="text-[10px] text-muted block mt-2 font-medium">
                            {new Date(act.activity_date).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="text-muted hover:text-danger-500 p-1 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist View */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                Couple Wishlists
              </h3>
              <Button size="sm" variant="primary" className="rounded-full h-8 w-8 p-0" onClick={() => setActiveSheet('wishlist')}>
                <Plus size={18} />
              </Button>
            </div>

            {loading ? (
              <Card variant="elevated" className="h-16 animate-pulse-soft" />
            ) : wishlists.length === 0 ? (
              <div className="text-center py-10 text-muted">
                <Gift size={32} className="mx-auto opacity-30 mb-2" />
                <p className="text-sm">No wishlist items created.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlists.map((wish) => (
                  <Card key={wish.id} variant="elevated" padding="md" className={wish.completed ? 'opacity-60' : ''}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge variant="default" className="bg-primary-50 text-primary-600 text-[10px] mb-1">
                          {WISHLIST_CATEGORIES[wish.category]}
                        </Badge>
                        <h4 className="text-sm font-bold text-foreground">{wish.title}</h4>
                      </div>
                      <button
                        onClick={() => handleDeleteWishlist(wish.id)}
                        className="text-muted hover:text-danger-500 p-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Progress Slider */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={wish.progress}
                        onChange={(e) => handleUpdateWishProgress(wish.id, Number(e.target.value))}
                        disabled={isPending}
                        className="flex-1 accent-primary-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-foreground w-8 text-right">
                        {wish.progress}%
                      </span>
                      {wish.completed && (
                        <CheckCircle size={16} className="text-success-500 flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Presence View */}
        {activeTab === 'presence' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
              Live Location Sharing
            </h3>

            <Card variant="elevated" padding="lg" className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                <Compass className="w-7 h-7 text-primary-500 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <h4 className="text-base font-bold text-foreground">Opt-in Presence Tracking</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed max-w-[260px]">
                Share your current coordinates with your partner securely. Only updated on trigger.
              </p>
              <Button size="md" className="mt-4 gap-1.5" onClick={handleShareLocation}>
                <MapPin size={16} />
                Share My Coordinates
              </Button>
            </Card>

            {partnerCoords ? (
              <Card variant="glass" padding="md" className="border-primary-100">
                <h4 className="text-sm font-bold text-foreground mb-1">Partner Latest Position</h4>
                <p className="text-xs text-muted leading-relaxed font-mono">
                  Latitude: {partnerCoords.lat.toFixed(5)}
                  <br />
                  Longitude: {partnerCoords.lng.toFixed(5)}
                </p>
                <div className="mt-3 text-xs text-primary-500 flex items-center gap-1.5">
                  <Badge variant="primary">Updated Live</Badge>
                </div>
              </Card>
            ) : (
              <div className="text-center py-6 text-muted">
                <p className="text-sm">Partner hasn&apos;t shared coordinates yet.</p>
              </div>
            )}
          </div>
        )}
      </SafeArea>

      {/* Add Activity Bottom Sheet */}
      <BottomSheet isOpen={activeSheet === 'activity'} onClose={() => setActiveSheet(null)} title="Log Couple Activity">
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground ml-1">Category</label>
            <select
              value={actCategory}
              onChange={(e) => setActCategory(e.target.value as any)}
              className="w-full h-12 neu-input px-4 text-base text-foreground bg-surface border-none"
            >
              {Object.entries(ACTIVITY_CATEGORIES).map(([cat, label]) => (
                <option key={cat} value={cat}>{label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Activity Title"
            placeholder="e.g. Dinner at Kemang, Watch Spiderman"
            value={actTitle}
            onChange={(e) => setActTitle(e.target.value)}
            required
          />

          <Input
            label="Description / Note"
            placeholder="e.g. Cozy place, ordered pasta"
            value={actDesc}
            onChange={(e) => setActDesc(e.target.value)}
          />

          <Input
            label="Date"
            type="date"
            value={actDate}
            onChange={(e) => setActDate(e.target.value)}
            required
          />

          <Button type="submit" size="md" fullWidth isLoading={isPending}>
            Add to Timeline
          </Button>
        </form>
      </BottomSheet>

      {/* Add Wishlist Bottom Sheet */}
      <BottomSheet isOpen={activeSheet === 'wishlist'} onClose={() => setActiveSheet(null)} title="Create Wishlist">
        <form onSubmit={handleAddWishlist} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground ml-1">Category</label>
            <select
              value={wishCategory}
              onChange={(e) => setWishCategory(e.target.value as any)}
              className="w-full h-12 neu-input px-4 text-base text-foreground bg-surface border-none"
            >
              {Object.entries(WISHLIST_CATEGORIES).map(([cat, label]) => (
                <option key={cat} value={cat}>{label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Wishlist Title"
            placeholder="e.g. Go to Japan, Buy matching hoodies"
            value={wishTitle}
            onChange={(e) => setWishTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground ml-1">Initial Progress</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={wishProgress}
                onChange={(e) => setWishProgress(Number(e.target.value))}
                className="flex-1 accent-primary-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-foreground w-8 text-right">
                {wishProgress}%
              </span>
            </div>
          </div>

          <Button type="submit" size="md" fullWidth isLoading={isPending}>
            Create Wishlist
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
