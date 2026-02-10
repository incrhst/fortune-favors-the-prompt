import { error, redirect } from '@sveltejs/kit';
import { getAccessToken, getUser } from '$lib/server/auth';
import { encryptSession } from '$lib/server/session';
import { upsertUser } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies.get('github_oauth_state');

    if (!code || !state || state !== storedState) {
        throw error(400, 'Invalid OAuth state');
    }

    cookies.delete('github_oauth_state', { path: '/' });

    const accessToken = await getAccessToken(code);
    if (!accessToken) {
        throw error(401, 'Failed to obtain access token');
    }

    const githubUser = await getUser(accessToken);
    if (!githubUser || !githubUser.id) {
        throw error(401, 'Failed to fetch user info from GitHub');
    }

    // Register/update user in our database
    const user = await upsertUser({
        github_id: githubUser.id,
        username: githubUser.login,
        name: githubUser.name,
        email: githubUser.email,
        avatar_url: githubUser.avatar_url
    });

    // Create session
    const session = await encryptSession({
        userId: user.github_id,
        username: user.username,
        accessToken
    });

    // Set session cookie
    cookies.set('session', session, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    throw redirect(302, '/');
};
