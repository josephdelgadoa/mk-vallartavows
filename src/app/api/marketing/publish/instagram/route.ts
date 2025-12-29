import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Note: Not using 'edge' runtime because we need 'fs' to write temp files
// export const runtime = 'edge'; 

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const FB_PAGE_ID = process.env.FB_PAGE_ID;

// Define public URL base - change this to your production URL
// In Docker/Hostinger, this is the public IP or domain
const PUBLIC_BASE_URL = 'http://72.62.162.228:8002';

// Helper to get Page Access Token if the provided one is a User Token
async function getPageAccessToken(userToken: string, pageId: string): Promise<string> {
    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${userToken}`);
        const data = await response.json();

        if (data.access_token) {
            console.log('Successfully exchanged User Token for Page Token (IG Route)');
            return data.access_token;
        }
        return userToken;
    } catch (e) {
        console.error('Token exchange failed:', e);
        return userToken;
    }
}

export async function POST(req: Request) {
    if (!FB_PAGE_ACCESS_TOKEN || !IG_USER_ID || !FB_PAGE_ID) {
        return NextResponse.json(
            { error: 'Credentials not configured (IG_USER_ID, FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID).' },
            { status: 500 }
        );
    }

    try {
        const { caption, imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL/Data is required for Instagram.' }, { status: 400 });
        }

        // Exchange Token FIRST
        // We need the Page Token to upload 'unpublished' photos to the Page
        const pageAccessToken = await getPageAccessToken(FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID);

        let publicImageUrl = imageUrl;

        // 1. Handle Base64 Image (Workaround: Upload to FB unpublished to get a public HTTPS URL)
        // Instagram requires a generic public URL. Hosting locally on HTTP IP often fails.
        // We leverage the FB Graph API to host it for us.
        if (imageUrl.startsWith('data:image')) {
            try {
                // Convert Base64 to Blob
                const formData = new FormData();
                formData.append('access_token', pageAccessToken); // Use PAGE Token
                formData.append('published', 'false'); // Don't show on Feed yet, just host it
                if (caption) formData.append('message', caption); // Optional metadata

                const base64Data = imageUrl.split(',')[1];
                const binaryStr = atob(base64Data);
                const len = binaryStr.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'image/png' });
                formData.append('source', blob, 'ig-temp.png');

                // Upload to FB Photos
                const fbUploadUrl = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`;
                const uploadRes = await fetch(fbUploadUrl, {
                    method: 'POST',
                    body: formData
                });

                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) {
                    console.error('FB Intermediate Upload Error:', uploadData);
                    throw new Error('Failed to upload image to Facebook (for hosting).');
                }

                const photoId = uploadData.id;

                // Get the 'source' (public HTTPS URL) of the uploaded photo
                // We need fields=webp_images or images to get the High Res version
                const urlRes = await fetch(`https://graph.facebook.com/v19.0/${photoId}?fields=images&access_token=${pageAccessToken}`);
                const urlData = await urlRes.json();

                // Get the largest image
                if (urlData.images && urlData.images.length > 0) {
                    publicImageUrl = urlData.images[0].source;
                    console.log('Obtained secure HTTPS URL from FB:', publicImageUrl);
                } else {
                    throw new Error('Could not retrieve image URL from Facebook.');
                }

            } catch (uploadError: any) {
                console.error('Image Hosting Error:', uploadError);
                return NextResponse.json({ error: 'Failed to process image for Instagram.' }, { status: 500 });
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
                access_token: pageAccessToken // Use Page Token here too to be consistent
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
                access_token: pageAccessToken
            })
        });

        const publishData = await publishRes.json();

        if (!publishRes.ok) {
            console.error('IG Publish Error:', publishData);
            throw new Error(publishData.error?.message || 'Failed to publish IG Media');
        }

        return NextResponse.json({
            success: true,
            postId: publishData.id
        });

    } catch (error: any) {
        console.error('IG Publish Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to publish to Instagram.' },
            { status: 500 }
        );
    }
}
