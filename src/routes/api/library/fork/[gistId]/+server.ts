import { json, error } from '@sveltejs/kit';
import { GistService } from '$lib/services/gist';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { gistId } = params;
    const gistService = new GistService(locals.user.accessToken);

    // 1. Fetch the original gist (public)
    const original = await gistService.getPromptGist(gistId);

    // 2. Create a new personal gist
    const newGistId = await gistService.createPromptGist({
        title: `Fork of ${original.title}`,
        content: original.content,
        category: original.category,
        tags: original.tags,
        collections: original.collections, // Preserve collections from original if any
        isPublic: false // Personal forks are private by default
    });

    // 3. Update the library index
    let indexData = await gistService.getLibraryIndex();
    const newEntry = {
        gistId: newGistId,
        title: `Fork of ${original.title}`,
        category: original.category,
        tags: original.tags,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        isPublic: false
    };

    if (indexData) {
        indexData.prompts.push(newEntry);
        indexData.updated = new Date().toISOString();
    } else {
        indexData = {
            version: 1,
            updated: new Date().toISOString(),
            collections: [],
            prompts: [newEntry]
        };
    }

    if (indexData) {
        await gistService.upsertLibraryIndex(indexData);
    }

    return json({ gistId: newGistId });
};
