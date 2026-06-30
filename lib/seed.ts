import { supabase } from './supabase/client';

// Seed data for MyKiv AI - Two couples with realistic data
export async function seedDatabase() {
  // Couple 1: Rifki & Mayly
  // Couple 2: Adrian & Nabila

  const couple1Code = 'RIFMAY';
  const couple2Code = 'ADRNAB';
  const couple1Id = 'couple_1a2b3c4d';
  const couple2Id = 'couple_5e6f7g8h';

  // Create auth users first (we'll use service role for this in practice)
  // For seeding, we'll insert profiles directly assuming auth users exist

  const rifkiId = '11111111-1111-1111-1111-111111111111';
  const maylyId = '22222222-2222-2222-2222-222222222222';
  const adrianId = '33333333-3333-3333-3333-333333333333';
  const nabilaId = '44444444-4444-4444-4444-444444444444';

  // Insert profiles
  await supabase.from('profiles').upsert([
    {
      id: rifkiId,
      email: 'rifki@example.com',
      full_name: 'Rifki',
      gender: 'male',
      date_of_birth: '1995-03-15',
      height_cm: 175,
      weight_kg: 70,
      partner_id: maylyId,
      couple_id: couple1Id,
      couple_code: couple1Code,
    },
    {
      id: maylyId,
      email: 'mayly@example.com',
      full_name: 'Mayly',
      gender: 'female',
      date_of_birth: '1996-07-22',
      height_cm: 162,
      weight_kg: 55,
      partner_id: rifkiId,
      couple_id: couple1Id,
      couple_code: couple1Code,
    },
    {
      id: adrianId,
      email: 'adrian@example.com',
      full_name: 'Adrian',
      gender: 'male',
      date_of_birth: '1994-11-08',
      height_cm: 180,
      weight_kg: 75,
      partner_id: nabilaId,
      couple_id: couple2Id,
      couple_code: couple2Code,
    },
    {
      id: nabilaId,
      email: 'nabila@example.com',
      full_name: 'Nabila',
      gender: 'female',
      date_of_birth: '1997-01-30',
      height_cm: 165,
      weight_kg: 58,
      partner_id: adrianId,
      couple_id: couple2Id,
      couple_code: couple2Code,
    },
  ]);

  // Generate meal logs for the past 2 weeks
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
  const foods = [
    { name: 'Oatmeal with Berries', cal: 350, p: 12, c: 60, f: 6 },
    { name: 'Grilled Chicken Salad', cal: 450, p: 40, c: 15, f: 20 },
    { name: 'Salmon with Rice', cal: 550, p: 35, c: 50, f: 22 },
    { name: 'Avocado Toast', cal: 320, p: 8, c: 35, f: 18 },
    { name: 'Greek Yogurt', cal: 150, p: 15, c: 10, f: 4 },
    { name: 'Protein Smoothie', cal: 280, p: 25, c: 30, f: 8 },
    { name: 'Beef Stir Fry', cal: 480, p: 30, c: 40, f: 20 },
    { name: 'Vegetable Soup', cal: 200, p: 8, c: 25, f: 6 },
  ];

  const mealLogs = [];
  for (let day = 0; day < 14; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString();

    for (const userId of [rifkiId, maylyId, adrianId, nabilaId]) {
      for (let m = 0; m < 3; m++) {
        const food = foods[Math.floor(Math.random() * foods.length)];
        mealLogs.push({
          user_id: userId,
          meal_type: mealTypes[m],
          food_name: food.name,
          calories: food.cal + Math.floor(Math.random() * 50 - 25),
          protein_g: food.p + Math.floor(Math.random() * 5 - 2),
          carbs_g: food.c + Math.floor(Math.random() * 10 - 5),
          fat_g: food.f + Math.floor(Math.random() * 5 - 2),
          logged_at: new Date(date.getTime() + m * 4 * 3600000).toISOString(),
        });
      }
    }
  }
  await supabase.from('meal_logs').insert(mealLogs);

  // Water logs
  const waterLogs = [];
  for (let day = 0; day < 14; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    for (const userId of [rifkiId, maylyId, adrianId, nabilaId]) {
      const glasses = Math.floor(Math.random() * 6) + 4;
      for (let g = 0; g < glasses; g++) {
        waterLogs.push({
          user_id: userId,
          amount_ml: [250, 330, 500][Math.floor(Math.random() * 3)],
          logged_at: new Date(date.getTime() + g * 2 * 3600000).toISOString(),
        });
      }
    }
  }
  await supabase.from('water_logs').insert(waterLogs);

  // Sleep logs
  const sleepLogs = [];
  for (let day = 0; day < 14; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    for (const userId of [rifkiId, maylyId, adrianId, nabilaId]) {
      const duration = 420 + Math.floor(Math.random() * 180 - 90);
      sleepLogs.push({
        user_id: userId,
        sleep_date: dateStr,
        duration_minutes: duration,
        quality_score: Math.min(10, Math.max(1, 6 + Math.floor(Math.random() * 4 - 2))),
        bed_time: new Date(date.getTime() + 22 * 3600000).toISOString(),
        wake_time: new Date(date.getTime() + 22 * 3600000 + duration * 60000).toISOString(),
      });
    }
  }
  await supabase.from('sleep_logs').insert(sleepLogs);

  // Exercise logs
  const exercises = ['Running', 'Yoga', 'Weight Training', 'Swimming', 'Cycling', 'HIIT', 'Pilates', 'Boxing'];
  const exerciseLogs = [];
  for (let day = 0; day < 14; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    for (const userId of [rifkiId, maylyId, adrianId, nabilaId]) {
      if (Math.random() > 0.3) {
        const ex = exercises[Math.floor(Math.random() * exercises.length)];
        const duration = 30 + Math.floor(Math.random() * 60);
        exerciseLogs.push({
          user_id: userId,
          exercise_type: ex,
          duration_minutes: duration,
          calories_burned: Math.floor(duration * (5 + Math.random() * 8)),
          intensity: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'moderate' | 'high',
          logged_at: date.toISOString(),
        });
      }
    }
  }
  await supabase.from('exercise_logs').insert(exerciseLogs);

  // Mood logs
  const moodLabels = ['Amazing', 'Great', 'Good', 'Okay', 'Fine', 'Not Good', 'Bad'];
  const moodLogs = [];
  for (let day = 0; day < 14; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    for (const userId of [rifkiId, maylyId, adrianId, nabilaId]) {
      const score = Math.min(10, Math.max(1, 5 + Math.floor(Math.random() * 5 - 2)));
      moodLogs.push({
        user_id: userId,
        mood_score: score,
        mood_label: moodLabels[Math.floor((10 - score) / 1.5)],
        notes: Math.random() > 0.7 ? 'Feeling productive today!' : null,
        logged_at: date.toISOString(),
      });
    }
  }
  await supabase.from('mood_logs').insert(moodLogs);

  // Medicine logs
  const medicines = ['Vitamin D', 'Omega-3', 'Multivitamin', 'Probiotic', 'Iron Supplement'];
  const medicineLogs = [];
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    for (const userId of [rifkiId, maylyId, adrianId, nabilaId]) {
      const med = medicines[Math.floor(Math.random() * medicines.length)];
      medicineLogs.push({
        user_id: userId,
        medicine_name: med,
        dosage: '1 tablet',
        status: Math.random() > 0.2 ? 'taken' : 'skipped',
        taken_at: date.toISOString(),
      });
    }
  }
  await supabase.from('medicine_logs').insert(medicineLogs);

  // Couple activities
  await supabase.from('couple_activities').insert([
    { couple_id: couple1Id, created_by: rifkiId, title: 'Weekend Beach Trip', description: 'Relaxing day at the coast', activity_type: 'travel', scheduled_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString(), status: 'planned' },
    { couple_id: couple1Id, created_by: maylyId, title: 'Cooking Class', description: 'Italian cuisine workshop', activity_type: 'cooking', scheduled_at: new Date(Date.now() + 3 * 24 * 3600000).toISOString(), status: 'planned' },
    { couple_id: couple1Id, created_by: rifkiId, title: 'Movie Night', description: 'Netflix and chill', activity_type: 'movie', status: 'completed' },
    { couple_id: couple2Id, created_by: adrianId, title: 'Hiking Adventure', description: 'Mountain trail exploration', activity_type: 'fitness', scheduled_at: new Date(Date.now() + 5 * 24 * 3600000).toISOString(), status: 'planned' },
    { couple_id: couple2Id, created_by: nabilaId, title: 'Dinner Date', description: 'Fine dining experience', activity_type: 'date', status: 'completed' },
  ]);

  // Wishlist items
  await supabase.from('wishlist_items').insert([
    { couple_id: couple1Id, created_by: rifkiId, title: 'Japan Trip', description: 'Cherry blossom season', category: 'travel', estimated_cost: 3000, priority: 5 },
    { couple_id: couple1Id, created_by: maylyId, title: 'Cooking Workshop', description: 'French pastry class', category: 'experience', estimated_cost: 200, priority: 4 },
    { couple_id: couple1Id, created_by: rifkiId, title: 'Smart Home Setup', description: 'Automated lighting and thermostat', category: 'item', estimated_cost: 500, priority: 3 },
    { couple_id: couple2Id, created_by: adrianId, title: 'Bali Getaway', description: 'Beach resort vacation', category: 'travel', estimated_cost: 2500, priority: 5 },
    { couple_id: couple2Id, created_by: nabilaId, title: 'Concert Tickets', description: 'Favorite band live', category: 'experience', estimated_cost: 300, priority: 4 },
  ]);

  // Expenses
  await supabase.from('expenses').insert([
    { couple_id: couple1Id, created_by: rifkiId, title: 'Groceries', amount: 120.50, category: 'food', split_type: 'equal', expense_date: new Date(Date.now() - 2 * 24 * 3600000).toISOString().split('T')[0] },
    { couple_id: couple1Id, created_by: maylyId, title: 'Movie Tickets', amount: 35.00, category: 'entertainment', split_type: 'equal', expense_date: new Date(Date.now() - 5 * 24 * 3600000).toISOString().split('T')[0] },
    { couple_id: couple1Id, created_by: rifkiId, title: 'Gas', amount: 45.00, category: 'bills', split_type: 'equal', expense_date: new Date(Date.now() - 1 * 24 * 3600000).toISOString().split('T')[0] },
    { couple_id: couple2Id, created_by: adrianId, title: 'Dinner', amount: 85.00, category: 'food', split_type: 'equal', expense_date: new Date(Date.now() - 3 * 24 * 3600000).toISOString().split('T')[0] },
    { couple_id: couple2Id, created_by: nabilaId, title: 'Gym Membership', amount: 60.00, category: 'health', split_type: 'equal', expense_date: new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0] },
  ]);

  // AI Memory
  await supabase.from('ai_memory').insert([
    { user_id: rifkiId, memory_type: 'preference', content: 'Prefers morning workouts', category: 'fitness', confidence: 0.9, source: 'exercise_logs' },
    { user_id: rifkiId, memory_type: 'fact', content: 'Goal to drink 2.5L water daily', category: 'health', confidence: 0.95, source: 'user_input' },
    { user_id: maylyId, memory_type: 'preference', content: 'Enjoys yoga and pilates', category: 'fitness', confidence: 0.85, source: 'exercise_logs' },
    { user_id: maylyId, memory_type: 'goal', content: 'Wants to improve sleep quality', category: 'health', confidence: 0.8, source: 'user_input' },
    { user_id: adrianId, memory_type: 'preference', content: 'Loves outdoor activities', category: 'lifestyle', confidence: 0.9, source: 'couple_activities' },
    { user_id: nabilaId, memory_type: 'insight', content: 'Mood improves after exercise', category: 'wellness', confidence: 0.75, source: 'mood_logs' },
  ]);

  // AI Reports
  await supabase.from('ai_reports').insert([
    { user_id: rifkiId, report_type: 'weekly', title: 'Weekly Health Summary', summary: 'Great week! You maintained consistent exercise and hit your water goals 5/7 days.', content: { exercise_count: 5, water_average: 2200, sleep_average: 7.2, mood_average: 7.5 } },
    { user_id: maylyId, report_type: 'weekly', title: 'Weekly Health Summary', summary: 'Good progress on sleep quality. Consider reducing screen time before bed.', content: { exercise_count: 4, water_average: 1900, sleep_average: 6.8, mood_average: 7.0 } },
    { user_id: rifkiId, report_type: 'relationship', title: 'Relationship Insights', summary: 'You and Mayly planned 2 new activities this week. Keep the momentum going!', content: { activities_planned: 2, shared_expenses: 200.5, wishlist_items: 3 } },
  ]);

  console.log('Seed data inserted successfully!');
}
