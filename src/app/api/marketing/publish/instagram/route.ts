
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Note: Not using 'edge' runtime because we need 'fs' to write temp files
// export const runtime = 'edge'; 

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;

// Define public URL base - change this to your production URL
// In Docker/Hostinger, this is the public IP or domain
const PUBLIC_BASE_URL = 'http://72.62.162.228:8002';

export async function POST(req: Request) {
    if (!FB_PAGE_ACCESS_TOKEN || !IG_USER_ID) {
        return NextResponse.json(
            { error: 'Instagram credentials not configured (IG_USER_ID, FB_PAGE_ACCESS_TOKEN).' },
            { status: 500 }
        );
    }

    try {
        const { caption, imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL/Data is required for Instagram.' }, { status: 400 });
        }

        let publicImageUrl = imageUrl;

        // 1. Handle Base64 Image (Required for Instagram API)
        // Instagram requires a PUBLIC INTERNET URL for the "image_url" parameter.
        // It does not support multipart/form-data upload for the basic Media endpoint easily in this flow.
        if (imageUrl.startsWith('data:image')) {
            try {
                // Ensure temp directory exists
                const tempDir = path.join(process.cwd(), 'public', 'temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }

                // Generate unique filename
                const uniqueId = crypto.randomUUID();
                const filename = `${uniqueId}.png`;
                const filePath = path.join(tempDir, filename);

                // Decode and Write
                const base64Data = imageUrl.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(filePath, buffer);

                // Construct Public URL
                publicImageUrl = `${PUBLIC_BASE_URL}/temp/${filename}`;
                console.log('Saved temp image for Instagram:', publicImageUrl);

            } catch (fsError: any) {
                console.error('Filesystem Error:', fsError);
                return NextResponse.json({ error: 'Failed to process image file on server.' }, { status: 500 });
            }
        }

        // 2. Create Media Container
        const containerUrl = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`;
        const containerRes = await fetch(containerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: publicImageUrl,
                caption: caption,
                access_token: FB_PAGE_ACCESS_TOKEN // User Token with IG permissions works here
            })
        });

        const containerData = await containerRes.json();

        if (!containerRes.ok) {
            console.error('IG Container Error:', containerData);
            throw new Error(containerData.error?.message || 'Failed to create IG Media Container');
        }

        const creationId = containerData.id;

        // 3. Publish Media Container
        const publishUrl = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`;
        const publishRes = await fetch(publishUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: FB_PAGE_ACCESS_TOKEN
            })
        });

        const publishData = await publishRes.json();

        if (!publishRes.ok) {
            console.error('IG Publish Error:', publishData);
            throw new Error(publishData.error?.message || 'Failed to publish IG Media');
        }

        // Optional: Cleanup temp file (async, don't wait)
        // setTimeout(() => {
        //    try { fs.unlinkSync(filePath); } catch (e) {}
        // }, 60000);

        return NextResponse.json({
            success: true,
            postId: publishData.id
            // IG doesn't give a direct permalink easily in response, but valid ID confirms post
        });

    } catch (error: any) {
        console.error('IG Publish Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to publish to Instagram.' },
            { status: 500 }
        );
    }
}
