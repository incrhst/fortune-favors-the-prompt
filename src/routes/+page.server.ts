import { getCuratedPrompts } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    try {
        const category = url.searchParams.get('category') || undefined;
        const prompts = await getCuratedPrompts({ category });

        return {
            prompts
        };
    } catch (e) {
        console.error('Failed to load community prompts:', e);
        return {
            prompts: [],
            error: 'Failed to load community prompts. Please try again later.'
        };
    }
};
