import { getApprovedPrompts } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const prompts = await getApprovedPrompts();
        return {
            prompts
        };
    } catch (e) {
        console.error('Failed to load prompts:', e);
        return {
            prompts: [],
            error: 'Failed to load prompts. Please try again later.'
        };
    }
};
