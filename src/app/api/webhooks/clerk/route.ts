import { NextRequest, NextResponse } from 'next/server';
import { handleClerkWebhook } from '@/features/auth/backend/webhook';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const headers = {
      'svix-id': req.headers.get('svix-id') || '',
      'svix-timestamp': req.headers.get('svix-timestamp') || '',
      'svix-signature': req.headers.get('svix-signature') || '',
    };

    const result = await handleClerkWebhook(payload, headers);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
