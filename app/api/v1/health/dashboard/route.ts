import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/repositories/supabase';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized', errors: [] }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    const [
      { data: meals },
      { data: water },
      { data: sleep },
      { data: exercise },
      { data: mood },
      { data: activities },
      { data: expenses },
    ] = await Promise.all([
      supabase.from('meal_logs').select('*').eq('user_id', userId).gte('logged_at', today),
      supabase.from('water_logs').select('amount_ml').eq('user_id', userId).gte('logged_at', today),
      supabase.from('sleep_logs').select('*').eq('user_id', userId).order('sleep_date', { ascending: false }).limit(1),
      supabase.from('exercise_logs').select('*').eq('user_id', userId).gte('logged_at', weekAgo),
      supabase.from('mood_logs').select('*').eq('user_id', userId).gte('logged_at', today).limit(1),
      profile?.couple_id ? supabase.from('couple_activities').select('*').eq('couple_id', profile.couple_id).order('created_at', { ascending: false }).limit(3) : { data: [] },
      profile?.couple_id ? supabase.from('expenses').select('amount').eq('couple_id', profile.couple_id).gte('expense_date', weekAgo.split('T')[0]) : { data: [] },
    ]);

    const waterTotal = water?.reduce((s, w) => s + (w.amount_ml || 0), 0) || 0;
    const expenseTotal = expenses?.reduce((s, e) => s + (e.amount || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      message: 'Dashboard loaded',
      data: {
        profile,
        stats: {
          mealsToday: meals?.length || 0,
          waterToday: waterTotal,
          sleepLastNight: sleep?.[0]?.duration_minutes || null,
          exerciseThisWeek: exercise?.length || 0,
          moodToday: mood?.[0]?.mood_score || null,
          activities: activities || [],
          expenseTotal,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Internal error', errors: [] }, { status: 500 });
  }
}
