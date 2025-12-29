
import { NextResponse } from 'next/server';
import { publishToFacebook } from '@/lib/publisher';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { message, imageUrl } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
        }

        const postId = await publishToFacebook(message, imageUrl);

        return NextResponse.json({
            success: true,
            postId: postId,
            postUrl: `https://facebook.com/${postId}`
        });

    } catch (error: any) {
        console.error('API Publish Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to publish post.' },
            { status: 500 }
        );
    }
}
