import { json, error } from '@sveltejs/kit';
import { nominatePrompt } from '$lib/db';
import { GistService } from '$lib/services/gist';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { gistId } = await request.json();
    const gistService = new GistService(locals.user.accessToken);

    // Verify the gist exists and is public
    const gist = await gistService.getPromptGist(gistId);
    if (!gist.isPublic) {
        throw error(400, 'Only public Gists can be nominated for the community library');
    }

    await nominatePrompt({
        gist_id: gistId,
        title: gist.title || 'Untitled Prompt',
        nominated_by: locals.user.username
    });

    return json({ success: true });
};
