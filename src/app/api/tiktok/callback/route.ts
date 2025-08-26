
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/ai/flows/tiktok-stats-flow';
import { run } from 'genkit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Here you should validate the 'state' parameter against the one stored in the user's session
  
  if (!code) {
    return new NextResponse('Authorization code not found.', { status: 400 });
  }

  try {
    const result = await run(exchangeCodeForToken, code);

    if (result.success) {
      // Redirect user to the page where they can see their stats
      const redirectUrl = new URL('/admin', req.url);
      redirectUrl.searchParams.set('view', 'platforms');
      redirectUrl.searchParams.set('tiktok_connected', 'true');
      return NextResponse.redirect(redirectUrl.toString());
    } else {
      return new NextResponse(`Failed to authenticate with TikTok: ${result.error}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('Callback error:', error);
    return new NextResponse('An internal error occurred during TikTok authentication.', { status: 500 });
  }
}
