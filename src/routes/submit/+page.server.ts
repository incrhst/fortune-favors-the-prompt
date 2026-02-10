import { createPrompt } from '$lib/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const text = formData.get('text') as string;
        const guestName = formData.get('guest_name') as string;
        const guestEmail = formData.get('guest_email') as string;
        const suggestedTitle = formData.get('suggested_title') as string;
        const category = formData.get('category') as string;
        const tagsRaw = formData.get('tags') as string;
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

        if (!text || !guestName) {
            return fail(400, { error: 'Please fill in all required fields.', text, guestName, guestEmail });
        }

        try {
            await createPrompt({
                text,
                guest_name: guestName,
                guest_email: guestEmail || undefined,
                suggested_title: suggestedTitle || undefined,
                category: category || undefined,
                tags: tags.length > 0 ? tags : undefined,
            });

            return { success: true };
        } catch (e) {
            console.error('Submission error:', e);
            return fail(500, { error: 'Failed to submit prompt. Please try again.', text, guestName, guestEmail });
        }
    }
};
