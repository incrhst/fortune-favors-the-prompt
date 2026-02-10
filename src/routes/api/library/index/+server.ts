import { json, error } from '@sveltejs/kit';
import { GistService } from '$lib/services/gist';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const gistService = new GistService(locals.user.accessToken);
    const index = await gistService.getLibraryIndex();

    return json(index || { version: 1, updated: new Date().toISOString(), prompts: [] });
};
