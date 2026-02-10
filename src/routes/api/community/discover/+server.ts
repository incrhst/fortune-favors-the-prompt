import { json } from '@sveltejs/kit';
import { getCuratedPrompts } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const category = url.searchParams.get('category') || undefined;
    const featuredOnly = url.searchParams.get('featured') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const prompts = await getCuratedPrompts({
        category,
        featuredOnly,
        limit,
        offset
    });

    return json({ prompts });
};
