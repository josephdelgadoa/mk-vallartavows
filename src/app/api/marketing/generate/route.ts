import { NextResponse } from 'next/server';
import { generateMarketingContent } from '@/lib/marketingGenerator';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const params = await req.json();

        // Use shared generation logic
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
