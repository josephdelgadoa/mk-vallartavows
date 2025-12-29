
import { NextResponse } from 'next/server';
import { publishToInstagram } from '@/lib/publisher';

// Note: Not using 'edge' runtime because shared library might use fs logic (though removed now, keeping safe)
// But wait, the shared library uses FormData/Blob which is Edge compatible.
// Let's keep existing runtime settings or default. 
// Existing route didn't use edge because of 'fs' import but we removed fs use in shared lib for uploading.
// However, let's stick to Node runtime to be safe if `atob` or other things behave differently.

export async function POST(req: Request) {
    try {
        const { caption, imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL/Data is required for Instagram.' }, { status: 400 });
        }

        const postId = await publishToInstagram(caption, imageUrl);

        return NextResponse.json({
            success: true,
            postId: postId
        });

    } catch (error: any) {
        console.error('API IG Publish Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to publish to Instagram.' },
            { status: 500 }
        );
    }
}
