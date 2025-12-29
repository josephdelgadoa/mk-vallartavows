
import { NextResponse } from 'next/server';
import { generateImage, ImageGenerationParams } from '@/lib/imageGenerator';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const params: ImageGenerationParams = await req.json();

        // Use shared generation logic
        const imageUrl = await generateImage(params);

        return NextResponse.json({ imageUrl });

    } catch (error: any) {
        console.error('API Image Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate image' },
            { status: 500 }
        );
    }
}
