import { getPromptById, getDiscussionsByPromptId, addDiscussion } from '$lib/db';
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;

    try {
        const prompt = await getPromptById(id);
        if (!prompt) {
            throw redirect(302, '/');
        }

        const discussions = await getDiscussionsByPromptId(id);

        return {
            prompt,
            discussions
        };
    } catch (e: any) {
        if (e.status === 302) throw e;
        console.error('Error loading prompt:', e);
        throw error(500, 'Failed to load prompt');
    }
};

export const actions: Actions = {
    addComment: async ({ params, request }) => {
        const { id } = params;
        const formData = await request.formData();
        const author = formData.get('author') as string;
        const text = formData.get('text') as string;

        if (!author || !text) {
            return fail(400, { error: 'Please provide both author and comment text.', author, text });
        }

        try {
            await addDiscussion({ prompt_id: id!, author, text });
            return { success: true };
        } catch (e) {
            console.error('Comment error:', e);
            return fail(500, { error: 'Failed to add comment.' });
        }
    }
};
