
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

const YouTubeStatsSchema = z.object({
  subscriberCount: z.string().describe("The total number of subscribers."),
  viewCount: z.string().describe("The total number of views for the channel."),
  videoCount: z.string().describe("The total number of videos on the channel."),
});

export type YouTubeStats = z.infer<typeof YouTubeStatsSchema>;

async function fetchYouTubeStats(): Promise<YouTubeStats | null> {
    if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
        console.error("YouTube API Key or Channel ID is not set in environment variables.");
        return null;
    }

    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('YouTube API Error:', errorData);
            throw new Error(`YouTube API request failed with status ${response.status}`);
        }
        const data = await response.json();
        const stats = data.items[0].statistics;

        return {
            subscriberCount: Number(stats.subscriberCount).toLocaleString('fr-FR'),
            viewCount: Number(stats.viewCount).toLocaleString('fr-FR'),
            videoCount: Number(stats.videoCount).toLocaleString('fr-FR'),
        };
    } catch (error) {
        console.error("Failed to fetch YouTube stats:", error);
        return null;
    }
}

export const getYoutubeChannelStats = ai.defineFlow(
  {
    name: 'getYoutubeChannelStats',
    inputSchema: z.void(),
    outputSchema: YouTubeStatsSchema.nullable(),
  },
  async () => {
    return await fetchYouTubeStats();
  }
);
