
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
  if (!TIKTOK_CLIENT_KEY) {
    return new NextResponse('TikTok client key is not configured.', { status: 500 });
  }

  const csrfState = Math.random().toString(36).substring(2);
  // You should store csrfState in the user's session for later validation

  const scopes = 'user.info.stats';
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/tiktok/callback`;
  
  let url = 'https://www.tiktok.com/v2/auth/authorize/';
  url += `?client_key=${TIKTOK_CLIENT_KEY}`;
  url += '&scope=' + encodeURIComponent(scopes);
  url += '&response_type=code';
  url += '&redirect_uri=' + encodeURIComponent(redirectUri);
  url += '&state=' + csrfState;
  
  return NextResponse.redirect(url);
}
