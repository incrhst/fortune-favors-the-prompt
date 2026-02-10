import { json, error } from '@sveltejs/kit';
import { GistService } from '$lib/services/gist';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { title, content, category, tags, isPublic } = await request.json();
    const gistService = new GistService(locals.user.accessToken);

    const gistId = await gistService.createPromptGist({
        title,
        content,
        category,
        tags,
        collections: [], // New prompts start with no collections
        isPublic: !!isPublic
    });

    // Update the library index
    let indexData = await gistService.getLibraryIndex();
    const newEntry = {
        gistId,
        title,
        category,
        tags,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        isPublic: !!isPublic
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

    if (indexData) { // This check stays to handle the null from getLibraryIndex more explicitly
        await gistService.upsertLibraryIndex(indexData);
    }

    return json({ gistId });
};
