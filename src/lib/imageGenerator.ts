
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export interface ImageGenerationParams {
    prompt: string;
    aspectRatio?: 'square' | 'portrait' | 'landscape';
    resolution?: '1k' | '2k' | '8k';
}

export async function generateImage(params: ImageGenerationParams): Promise<string> {
    if (!GOOGLE_API_KEY) {
        throw new Error('Google API Key not configured');
    }

    const { prompt, aspectRatio = 'square', resolution = '1k' } = params;

    if (!prompt) {
        throw new Error('Prompt is required');
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

    const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

    if (base64Image) {
        return `data:image/png;base64,${base64Image}`;
    } else {
        throw new Error('No image returned from Imagen API');
    }
}
