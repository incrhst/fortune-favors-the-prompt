import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { text } = await request.json();

        if (!text || text.length < 10) {
            return new Response(JSON.stringify({ error: 'Prompt text too short' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apiKey = import.meta.env.VERCEL_AI_GATEWAY_API_KEY;

        // Mock response if no key (dev mode)
        if (!apiKey || apiKey.includes('your_vercel_ai_gateway_key')) {
            return new Response(JSON.stringify({
                suggestedTitle: 'AI-Generated Title (Mock)',
                category: 'Research',
                tags: ['prompt', 'ai', 'dev']
            }), { status: 200 });
        }

        // Call Vercel AI Gateway directly via fetch
        // Using openai/gpt-4o-mini model
        const response = await fetch('https://gateway.ai.vercel.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'X-Vercel-AI-Provider': 'openai' // Optional, but good practice
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
                response_format: { type: "json_object" } // Force JSON mode
            })
        });

        if (!response.ok) {
            throw new Error(`AI Gateway error: ${response.statusText}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Classification error:', error);

        // Fallback response
        return new Response(JSON.stringify({
            suggestedTitle: 'New Prompt',
            category: 'Creative',
            tags: ['prompt']
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
