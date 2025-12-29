
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;

export async function POST(req: Request) {
    if (!FB_PAGE_ACCESS_TOKEN || !FB_PAGE_ID) {
        return NextResponse.json(
            { error: 'Facebook Page credentials not configured on server (FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN).' },
            { status: 500 }
        );
    }

    try {
        const { message, imageUrl } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
        }

        // Determine endpoint: /feed (text only) or /photos (text + image)
        const endpoint = imageUrl
            ? `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`
            : `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`;

        const body: any = {
            access_token: FB_PAGE_ACCESS_TOKEN,
            message: message
        };

        if (imageUrl) {
            body.url = imageUrl;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Facebook API Error:', data);
            throw new Error(data.error?.message || 'Failed to post to Facebook');
        }

        return NextResponse.json({
            success: true,
            postId: data.id,
            postUrl: `https://facebook.com/${data.id}`
        });

    } catch (error: any) {
        console.error('Publish Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to publish post.' },
            { status: 500 }
        );
    }
}
