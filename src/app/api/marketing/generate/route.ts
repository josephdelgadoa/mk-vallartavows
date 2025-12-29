import { NextResponse } from 'next/server';
import { generateMarketingContent } from '@/lib/marketingGenerator';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const params = await req.json();

        // Use shared generation logic
        // Default to random aesthetic if not provided (for manual tests compatibility)
        if (!params.aesthetic) {
            const { AESTHETICS } = await import('@/lib/marketingGenerator');
            params.aesthetic = AESTHETICS[Math.floor(Math.random() * AESTHETICS.length)];
        }

        const content = await generateMarketingContent(params);

        return NextResponse.json(content);

    } catch (error: any) {
        console.error('API Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate content' },
            { status: 500 }
        );
    }
}
