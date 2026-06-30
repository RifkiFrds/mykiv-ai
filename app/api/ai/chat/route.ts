import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    if (!message || !userId) {
      return NextResponse.json({ error: 'Missing message or userId' }, { status: 400 });
    }

    // Simple AI response without external API for now
    // In production, this would call Gemini Flash 2.5
    const responses: Record<string, string> = {
      'How did I sleep?': 'Based on your recent sleep logs, you\'ve been averaging about 7 hours per night with a quality score of 7.5/10. That\'s great! Try to maintain a consistent bedtime.',
      'Suggest a date idea': 'How about a cooking class together? It\'s fun, interactive, and you\'ll learn something new as a couple. Check your wishlist for more ideas!',
      'My mood today': 'I see you logged a mood of 7/10 today - that\'s pretty good! Remember, it\'s normal to have ups and downs. Would you like some mindfulness tips?',
      'Health tips': 'Here are 3 quick tips: 1) Drink water before every meal, 2) Take a 10-min walk after lunch, 3) Set a consistent sleep schedule. Small habits make big differences!',
    };

    // Find matching response or generate generic
    let response = responses[message];
    if (!response) {
      response = `Thanks for asking! I'm here to help with your health and relationship goals. You asked: "${message}". Could you tell me more about what you'd like to know?`;
    }

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
