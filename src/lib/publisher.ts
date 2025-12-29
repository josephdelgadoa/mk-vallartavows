
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const IG_USER_ID = process.env.IG_USER_ID;

// Helper to get Page Access Token if the provided one is a User Token
async function getPageAccessToken(userToken: string, pageId: string): Promise<string> {
    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${userToken}`);
        const data = await response.json();

        if (data.access_token) {
            return data.access_token;
        }
        return userToken;
    } catch (e) {
        console.error('Token exchange failed:', e);
        return userToken;
    }
}

export async function publishToFacebook(message: string, imageUrl: string): Promise<string> {
    if (!FB_PAGE_ACCESS_TOKEN || !FB_PAGE_ID) {
        throw new Error('Facebook Page credentials not configured.');
    }

    const pageAccessToken = await getPageAccessToken(FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID);

    let endpoint = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`;
    let body: any = JSON.stringify({
        access_token: pageAccessToken,
        message: message
    });
    let headers: any = { 'Content-Type': 'application/json' };

    if (imageUrl) {
        // STRATEGY: To post to the "Wall" (Feed) with an image, we perform a 2-step process:
        // 1. Upload the photo to /photos with published=false (to get a media ID).
        // 2. Post to /feed with object_attachment=photo_id.

        let photoId: string;

        // Step 1: Upload Photo (Unpublished)
        const uploadUrl = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`;

        if (imageUrl.startsWith('data:image')) {
            const formData = new FormData();
            formData.append('access_token', pageAccessToken);
            formData.append('published', 'false'); // Important!

            const base64Data = imageUrl.split(',')[1];
            const binaryStr = atob(base64Data);
            const len = binaryStr.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'image/png' });
            formData.append('source', blob, 'generated-image.png');

            const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Failed to upload photo to Facebook');
            photoId = uploadData.id;

        } else {
            // URL-based upload
            const uploadRes = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_token: pageAccessToken,
                    url: imageUrl,
                    published: false
                })
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Failed to upload photo to Facebook');
            photoId = uploadData.id;
        }

        // Step 2: Post to Feed
        endpoint = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`;
        body = JSON.stringify({
            access_token: pageAccessToken,
            message: message,
            object_attachment: photoId // Attach the uploaded photo to the status update
        });
        headers = { 'Content-Type': 'application/json' };
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to post to Facebook');
    }

    return data.id;
}

export async function publishToInstagram(caption: string, imageUrl: string): Promise<string> {
    if (!FB_PAGE_ACCESS_TOKEN || !IG_USER_ID || !FB_PAGE_ID) {
        throw new Error('Instagram credentials not configured.');
    }

    const pageAccessToken = await getPageAccessToken(FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID);
    let publicImageUrl = imageUrl;

    // 1. Handle Base64 Image (Upload to FB unpublished -> Public URL)
    if (imageUrl.startsWith('data:image')) {
        const formData = new FormData();
        formData.append('access_token', pageAccessToken);
        formData.append('published', 'false');
        if (caption) formData.append('message', caption);

        const base64Data = imageUrl.split(',')[1];
        const binaryStr = atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'image/png' });
        formData.append('source', blob, 'ig-temp.png');

        const fbUploadUrl = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`;
        const uploadRes = await fetch(fbUploadUrl, { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) throw new Error('Failed to upload image to Facebook (hosting).');

        const photoId = uploadData.id;
        const urlRes = await fetch(`https://graph.facebook.com/v19.0/${photoId}?fields=images&access_token=${pageAccessToken}`);
        const urlData = await urlRes.json();

        if (urlData.images && urlData.images.length > 0) {
            publicImageUrl = urlData.images[0].source;
        } else {
            throw new Error('Could not retrieve image URL from Facebook.');
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
            access_token: pageAccessToken
        })
    });
    const containerData = await containerRes.json();
    if (!containerRes.ok) throw new Error(containerData.error?.message || 'Failed to create IG Media Container');

    const creationId = containerData.id;

    // 2.5 Poll for Readiness
    let isReady = false;
    let attempts = 0;
    while (attempts < 10 && !isReady) {
        attempts++;
        const statusRes = await fetch(`https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${pageAccessToken}`);
        const statusData = await statusRes.json();
        if (statusData.status_code === 'FINISHED') isReady = true;
        else if (statusData.status_code === 'ERROR') throw new Error('Instagram Media Processing Failed');
        else await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (!isReady) throw new Error('Timeout waiting for Instagram Media.');

    // 3. Publish
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

    if (!publishRes.ok) throw new Error(publishData.error?.message || 'Failed to publish IG Media');

    return publishData.id;
}
