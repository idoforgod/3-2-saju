import { handleClerkWebhook } from '@/features/auth/backend/webhook';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Clerk Webhook 엔드포인트
 * POST /api/webhooks/clerk
 */
export async function POST(req: NextRequest) {
  const payload = await req.text();

  const headers = {
    'svix-id': req.headers.get('svix-id') || '',
    'svix-timestamp': req.headers.get('svix-timestamp') || '',
    'svix-signature': req.headers.get('svix-signature') || '',
  };

  try {
    await handleClerkWebhook(payload, headers);
    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
