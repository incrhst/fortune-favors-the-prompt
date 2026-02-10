import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VERCEL_AI_GATEWAY_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { text } = await request.json();

        if (!text || text.length < 10) {
            return json({ error: 'Prompt text too short' }, { status: 400 });
        }

        // Mock response if no key (dev mode)
        if (!VERCEL_AI_GATEWAY_API_KEY || VERCEL_AI_GATEWAY_API_KEY.includes('your_vercel_ai_gateway_key')) {
            return json({
                suggestedTitle: 'AI-Generated Title (Mock)',
                category: 'Research',
                tags: ['prompt', 'ai', 'dev']
            });
        }

        // Call Vercel AI Gateway directly via fetch
        const response = await fetch('https://gateway.ai.vercel.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${VERCEL_AI_GATEWAY_API_KEY}`,
                'X-Vercel-AI-Provider': 'openai'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful assistant that classifies prompts. 
            Respond ONLY with a valid JSON object containing:
            - suggestedTitle: concise title (max 60 chars)
            - category: one of [Code Review, Research, Writing, Education, Business, Lifestyle, Creative]
            - tags: array of max 5 strings`
                    },
                    {
                        role: 'user',
                        content: `Classify this prompt: ${text.slice(0, 500)}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 150,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`AI Gateway error: ${response.statusText}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return json(result);

    } catch (error) {
        console.error('Classification error:', error);
        return json({
            suggestedTitle: 'New Prompt',
            category: 'Creative',
            tags: ['prompt']
        });
    }
};
