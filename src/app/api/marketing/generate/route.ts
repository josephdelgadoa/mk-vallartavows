
import { NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export const runtime = 'edge';

// --- Knowledge Base ---
const CATERING_KNOWLEDGE = `
Wedding Catering in Puerto Vallarta
At Vallarta Vows, we believe that a wedding feast should be just as memorable as the ceremony itself. Our catering philosophy blends authentic Mexican flavors, personalized menus, and seamless on-site service to reflect your love story through food. Whether you dream of a sunset taco bar or an elegant vegan spread, we’ll craft a culinary experience your guests will savor forever.

Authentic Flavors, Elegant Service & Custom Menus for Your Special Day.
On-Site Chefs: Professional chefs bring the kitchen to your venue for fresh preparation and flawless presentation.
Full Bar Options: Signature cocktails, beer, margaritas & curated wine pairings.

Menus:
1. Taco Night Wedding Menu: festive, casual, colorful. 
   Starters: Guacamole, Pico, Chicken Crispy Tacos, Quesadillas, Empanadas, Sopes, Ceviche.
   Mains: Chicken, Beef, Pork Pastor (Taco Cart).
   Dessert: Churros.
2. Mexican Buffet Wedding Menu: family-style.
   Entrees: Pork in Green Sauce, Chicken Mole, Grilled Carne Asada.
   Sides: Grilled Veggies, Rice, Beans.
3. Vegan & Plant-Based: Eco-friendly.
   Stuffed Peppers, Enfrijoladas, Black Bean Burritos, Vegan Tamales, Vegan Taquitos.
`;

export async function POST(req: Request) {
    if (!GOOGLE_API_KEY) {
        console.error("GOOGLE_API_KEY is missing in environment variables.");
        return NextResponse.json({ error: 'Google API Key not configured' }, { status: 500 });
    }
    console.log("Using Google API Key:", GOOGLE_API_KEY ? `...${GOOGLE_API_KEY.slice(-4)}` : "None");

    try {
        const { service, audience, tone, featureRobin, music } = await req.json();

        let systemPrompt = `You are a world-class marketing copywriter for "Vallarta Vows", a premier wedding planning agency in Puerto Vallarta, Mexico.
        
        Brand Voice: ${tone}
        Key Persona: Robin Manoogian (Founder, 15+ years exp).
        Target Audience: ${audience}
        Selected Service: ${service}
        Feature Robin: ${featureRobin ? 'YES - Write in the first person as Robin Manoogian (Founder). Use "I", "my". Share personal insights from 15+ years of experience. Be warm, authoritative, and welcoming.' : 'NO - Write in the "Vallarta Vows" brand voice (we/us). Professional, elegant, and inviting.'}

        [MUSIC ATMOSPHERE]
        ${music ? `The event features live music: "${music}". Explicitly describe how this specific musical choice creates an unforgettable engaging atmosphere (e.g. the romance of a Trio, the high-energy of a 10-piece Mariachi big band).` : 'No specific music selected.'}

        [CATERING KNOWLEDGE]
        ${service === 'Catering Menu' ? `Use the following details to describe the culinary experience. be specific about dishes:\n${CATERING_KNOWLEDGE}` : ''}

        CRITICAL REQUIREMENTS:
        1. PERSUASION: Use strong, emotional, and persuasive keywords (e.g., "Exclusive", "Bespoke", "Unforgettable", "Stress-Free").
        2. CALL TO ACTION (CTA): MUST strictly follow this format at the end of the post:
           🇺🇸 WhatsApp USA: +1 (646) 216-8516
           🇲🇽 WhatsApp Mexico: +52 322-170-3027
           🌐 vallartavows.com
           📧 info@vallartavows.com
        3. VIRALITY: MUST include the Top 15 trending wedding/travel hashtags at the end of every post.
        4. FORMATTING: Use DOUBLE SPACING (two newlines) between: The Main Content, The CTA, and The Hashtags.
        5. IMAGE PROMPT: 
           - If Service is "Catering Menu": "Close-up glossy food photography, 8k, diverse Mexican wedding buffet, vibrant colors, delicious presentation, photorealistic."
           - If Music is selected: "Wedding reception scene featuring ${music}, cinematic lighting, photorealistic, 8k, joyful atmosphere."
           - Otherwise: "Professional photo taken with the most expensive camera of the world 2025, 8k, hyper-realistic, ensuring the scene matches the service/venue perfectly."

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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
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

        // Robust JSON Extraction: Handle Markdown code blocks (```json ... ```)
        let cleanText = rawText.trim();
        // Remove markdown code blocks if present
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        // Find the first '{' and last '}' to handle potential preamble/postamble text
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        const content = JSON.parse(cleanText);

        return NextResponse.json(content);

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate content' },
            { status: 500 }
        );
    }
}
