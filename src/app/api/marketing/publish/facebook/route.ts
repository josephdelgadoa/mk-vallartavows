
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

        // Determine if we are posting an image or just text
        // Note: Graph API requires multipart/form-data for direct file uploads (source)
        // or a public URL for proper 'url' parameter usage. 
        // Generative AI often returns base64, so we must handle that.

        const isImagePost = !!imageUrl;
        let endpoint = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`;
        const method = 'POST';

        // Prepare body (default JSON)
        // If uploading binary, we switch to FormData
        let body: any = JSON.stringify({
            access_token: FB_PAGE_ACCESS_TOKEN,
            message: message
        });
        let headers: any = { 'Content-Type': 'application/json' };

        if (isImagePost) {
            endpoint = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`;

            // Check if base64
            if (imageUrl.startsWith('data:image')) {
                // Convert Base64 to Blob for FormData upload
                const formData = new FormData();
                formData.append('access_token', FB_PAGE_ACCESS_TOKEN);
                formData.append('message', message);

                // Extract base64 functionality
                const base64Data = imageUrl.split(',')[1];
                const binaryStr = atob(base64Data);
                const len = binaryStr.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'image/png' });

                formData.append('source', blob, 'generated-image.png');

                body = formData;
                headers = {}; // Let fetch set boundary for multipart
            } else {
                // Public URL
                body = JSON.stringify({
                    access_token: FB_PAGE_ACCESS_TOKEN,
                    message: message,
                    url: imageUrl
                });
            }
        }

        const response = await fetch(endpoint, {
            method,
            headers,
            body
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Facebook API Error response:', data);
            throw new Error(data.error?.message || 'Failed to post to Facebook');
        }

        return NextResponse.json({
            success: true,
            postId: data.id,
            postUrl: `https://facebook.com/${data.id}` // Approximation, strict URL depends on post type
        });

    } catch (error: any) {
        console.error('Publish Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to publish post.' },
            { status: 500 }
        );
    }
}
