
import { NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export const runtime = 'edge';

export async function POST(req: Request) {
    if (!GOOGLE_API_KEY) {
        console.error("GOOGLE_API_KEY is missing in environment variables.");
        return NextResponse.json({ error: 'Google API Key not configured' }, { status: 500 });
    }
    console.log("Using Google API Key:", GOOGLE_API_KEY ? `...${GOOGLE_API_KEY.slice(-4)}` : "None");

    try {
        const { service, audience, tone, featureRobin } = await req.json();

        const systemPrompt = `You are a world-class marketing copywriter for "Vallarta Vows", a premier wedding planning agency in Puerto Vallarta, Mexico.
        
        Brand Voice: ${tone}
        Key Persona: Robin Manoogian (Founder, 15+ years exp).
        Target Audience: ${audience}
        Selected Service: ${service}
        Feature Robin: ${featureRobin ? 'YES - Write in first person as Robin.' : 'NO - Write in brand voice (we/us).'}

        CRITICAL REQUIREMENTS:
        1. PERSUASION: Use strong, emotional, and persuasive keywords (e.g., "Exclusive", "Bespoke", "Unforgettable", "Stress-Free").
        2. CALL TO ACTION (CTA): MUST include BOTH the Mexico 🇲🇽 and USA 🇺🇸 flags.
        3. CONTACT: MUST include email "info@vallartavows.com".
        4. VIRALITY: MUST include the Top 15 trending wedding/travel hashtags at the end of every post.
        5. FORMATTING: Use DOUBLE SPACING (two newlines) between: The Main Content, The CTA, and The Hashtags.
        6. IMAGE PROMPT: The "imagePrompt" key MUST describe a "Professional photo taken with the most expensive camera of the world 2025", 8k, hyper-realistic, ensuring the scene matches the service/venue perfectly.

        Task: Generate marketing content for 5 platforms + 1 image prompt.
        Return JSON ONLY. No markdown formatting.
        
        Structure:
        {
            "facebook": "Post text...",
            "instagram": "Caption text...",
            "reels": "Script/Idea...",
            "tiktok": "Script/Idea...",
            "youtube": "Video Title + Description...",
            "imagePrompt": "Detailed AI image prompt..."
        }
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: `Generate campaign for ${service} targeting ${audience}.` }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Google Gemini API Error');
        }

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('No content generated');

        const content = JSON.parse(rawText);

        return NextResponse.json(content);

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate content' },
            { status: 500 }
        );
    }
}
