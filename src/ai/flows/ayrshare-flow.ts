
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';

const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY;

const SocialStatsSchema = z.object({
  followers: z.number().describe("The total number of followers."),
  following: z.number().describe("The total number of accounts the user is following."),
  likes: z.number().describe("The total number of likes for the account's videos."),
  views: z.number().optional().describe("The total number of views."),
});

export type SocialStats = z.infer<typeof SocialStatsSchema>;

async function fetchAyrshareStats(platform: 'tiktok' | 'youtube' | 'facebook'): Promise<SocialStats | null> {
    if (!AYRSHARE_API_KEY) {
        console.error("Ayrshare API Key is not set in environment variables.");
        return null;
    }

    const url = `https://app.ayrshare.com/api/profiles/${platform}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${AYRSHARE_API_KEY}`,
            },
        });

        if (response.data && response.data.profiles && response.data.profiles.length > 0) {
            // Assuming the first profile is the one we want
            const profile = response.data.profiles[0];
            return {
                followers: profile.stats.followers,
                following: profile.stats.following,
                likes: profile.stats.likes,
                views: profile.stats.views,
            };
        }
        return null;

    } catch (error: any) {
        console.error(`Failed to fetch ${platform} stats from Ayrshare:`, error.response?.data || error.message);
        return null;
    }
}

export const getSocialStats = ai.defineFlow(
  {
    name: 'getSocialStats',
    inputSchema: z.enum(['tiktok', 'youtube', 'facebook']),
    outputSchema: SocialStatsSchema.nullable(),
  },
  async (platform) => {
    return await fetchAyrshareStats(platform);
  }
);
