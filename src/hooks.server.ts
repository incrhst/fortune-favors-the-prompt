import { decryptSession } from '$lib/server/session';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const sessionCookie = event.cookies.get('session');
    const apiKey = event.request.headers.get('X-API-Key');

    if (sessionCookie) {
        const session = await decryptSession(sessionCookie);
        if (session) {
            event.locals.user = {
                id: session.userId,
                username: session.username,
                accessToken: session.accessToken
            };
        } else {
            // Invalid session, clear cookie
            event.cookies.delete('session', { path: '/' });
        }
    } else if (apiKey) {
        // Support for Agent-based access via API keys
        // For now, we allow the encrypted session string to be used as an API key
        // This makes it compatible with both agents and the web app
        const session = await decryptSession(apiKey);
        if (session) {
            event.locals.user = {
                id: session.userId,
                username: session.username,
                accessToken: session.accessToken
            };
        }
    }

    return resolve(event);
};
