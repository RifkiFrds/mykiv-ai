import { NextRequest, NextResponse } from 'next/server';
import { aiChatSchema } from '@/shared/validators/schemas';
import { processChat } from '@/ai/brain';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = aiChatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { message, userId } = parsed.data;
    const { response } = await processChat(userId, message);

    return NextResponse.json({ success: true, message: 'Response generated', data: { response } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Internal error', errors: [] }, { status: 500 });
  }
}
