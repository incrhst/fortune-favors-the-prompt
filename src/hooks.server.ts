import { decryptSession } from '$lib/server/session';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const sessionCookie = event.cookies.get('session');

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
    }

    return resolve(event);
};
