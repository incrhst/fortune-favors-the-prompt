import { getCuratedPromptByGistId, getDiscussionsByPromptId } from '$lib/db';
import { GistService } from '$lib/services/gist';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { gistId } = params;

    try {
        const curated = await getCuratedPromptByGistId(gistId);
        if (!curated) {
            throw error(404, 'Prompt not found in community library');
        }

        // Fetch actual content from Gist (or use curated index if we want to be faster)
        // For now, let's trust the curation table but maybe fetch fresh from Gist later
        // if we want to support versioning.

        const discussions = await getDiscussionsByPromptId(gistId);

        return {
            prompt: curated,
            discussions
        };
    } catch (e: any) {
        if (e.status) throw e;
        console.error('Error loading community prompt:', e);
        throw error(500, 'Failed to load prompt');
    }
};
