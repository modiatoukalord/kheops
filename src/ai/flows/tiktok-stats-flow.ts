
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { defineFlow, run } from 'genkit';
import axios from 'axios';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

const TiktokStatsSchema = z.object({
  follower_count: z.number().describe("The total number of followers."),
  following_count: z.number().describe("The total number of accounts the user is following."),
  likes_count: z.number().describe("The total number of likes for the account's videos."),
  video_count: z.number().describe("The total number of videos on the account."),
});

export type TiktokStats = z.infer<typeof TiktokStatsSchema>;

// This is a mock database to store tokens. In a real app, use a proper database.
let tokenStore: { accessToken?: string, refreshToken?: string, expires_in?: number, open_id?: string } = {};

export const exchangeCodeForToken = defineFlow(
  {
    name: 'exchangeCodeForToken',
    inputSchema: z.string(),
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (authCode) => {
    if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
      console.error("TikTok client key or secret is not set.");
      return { success: false, error: "TikTok credentials not configured." };
    }

    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    const params = new URLSearchParams();
    params.append('client_key', TIKTOK_CLIENT_KEY);
    params.append('client_secret', TIKTOK_CLIENT_SECRET);
    params.append('code', authCode);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/tiktok/callback`);

    try {
      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, refresh_token, expires_in, open_id } = response.data;
      tokenStore = { accessToken: access_token, refreshToken: refresh_token, expires_in, open_id };

      return { success: true };
    } catch (error: any) {
      console.error('Error exchanging code for token:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error_description || 'Failed to exchange code for token' };
    }
  }
);


export const getTiktokStats = ai.defineFlow(
  {
    name: 'getTiktokStats',
    inputSchema: z.void(),
    outputSchema: TiktokStatsSchema.nullable(),
  },
  async () => {
    if (!tokenStore.accessToken) {
        // Not authenticated yet, return null or mock data if you want to handle this case
        return null;
    }
    
    try {
        const userStatsUrl = 'https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count';

        const response = await axios.get(userStatsUrl, {
            headers: {
                'Authorization': `Bearer ${tokenStore.accessToken}`,
            },
        });

        if (response.data.error.code !== "ok") {
            throw new Error(`TikTok API Error: ${response.data.error.message}`);
        }

        return response.data.data.user;

    } catch (error: any) {
        console.error("Failed to fetch TikTok stats:", error.response?.data || error.message);
        // Could implement token refresh logic here if the error indicates an expired token
        return null;
    }
  }
);
