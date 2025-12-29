
import { NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export const runtime = 'edge';

export async function POST(req: Request) {
    if (!GOOGLE_API_KEY) {
        return NextResponse.json({ error: 'Google API Key not configured' }, { status: 500 });
    }

    try {
        const { prompt, aspectRatio = 'square', resolution = '1k' } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Map Aspect Ratio for Imagen
        let ratio = '1:1';
        if (aspectRatio === 'portrait') ratio = '9:16';
        if (aspectRatio === 'landscape') ratio = '16:9';

        // Enhance Prompt based on "Resolution" setting
        let finalPrompt = prompt;
        if (resolution === '2k') {
            finalPrompt = `${prompt}, 4k resolution, detailed, professional photography`;
        } else if (resolution === '8k') {
            finalPrompt = `${prompt}, 8k resolution, highly detailed, sharp focus, hyper-realistic, masterpiece, best quality`;
        }

        // Call Imagen 4 Model via Google Generative AI REST API (Predict)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [{ prompt: finalPrompt }],
                parameters: {
                    aspectRatio: ratio,
                    sampleCount: 1
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Google Imagen API Error');
        }

        // Imagen returns base64 encoded bytes usually for this endpoint
        // Structure: prediction: { bytesBase64Encoded: "..." } or similar depending on exact version
        // Let's handle the standard "predictions" array
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        let imageUrl = '';

        if (base64Image) {
            imageUrl = `data:image/png;base64,${base64Image}`;
        } else {
            // Fallback/Safety check if structure differs
            throw new Error('No image returned from Imagen API');
        }

        return NextResponse.json({ imageUrl });

    } catch (error: any) {
        console.error('Image Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate image' },
            { status: 500 }
        );
    }
}
