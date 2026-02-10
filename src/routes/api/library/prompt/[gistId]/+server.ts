import { json, error } from '@sveltejs/kit';
import { GistService } from '$lib/services/gist';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { gistId } = params;
    const gistService = new GistService(locals.user.accessToken);
    const prompt = await gistService.getPromptGist(gistId);

    return json(prompt);
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { gistId } = params;
    const updates = await request.json();
    const gistService = new GistService(locals.user.accessToken);

    await gistService.updatePromptGist(gistId, updates);

    // Update index as well if title, category, or tags changed
    const indexData = await gistService.getLibraryIndex();
    if (indexData) {
        const promptIndex = indexData.prompts.findIndex(p => p.gistId === gistId);
        if (promptIndex !== -1) {
            const indexUpdate = { ...updates };
            if (updates.collections) {
                indexUpdate.collectionIds = updates.collections;
                delete indexUpdate.collections;
            }

            indexData.prompts[promptIndex] = {
                ...indexData.prompts[promptIndex],
                ...indexUpdate,
                updated: new Date().toISOString()
            };
            indexData.updated = new Date().toISOString();
            await gistService.upsertLibraryIndex(indexData);
        }
    }

    return json({ success: true });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { gistId } = params;
    const gistService = new GistService(locals.user.accessToken);

    await gistService.deletePromptGist(gistId);

    // Remove from index
    const indexData = await gistService.getLibraryIndex();
    if (indexData) {
        indexData.prompts = indexData.prompts.filter(p => p.gistId !== gistId);
        indexData.updated = new Date().toISOString();
        await gistService.upsertLibraryIndex(indexData);
    }

    return json({ success: true });
};
