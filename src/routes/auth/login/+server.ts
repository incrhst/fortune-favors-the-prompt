import { redirect } from '@sveltejs/kit';
import { GITHUB_CLIENT_ID } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ cookies }) => {
    const state = crypto.randomUUID();
    cookies.set('github_oauth_state', state, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax'
    });

    const redirectUri = `${PUBLIC_BASE_URL}/auth/callback`;
    const authUrl = `https://github.com/login/oauth/authorize?${new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: 'gist,read:user,user:email',
        state
    })}`;

    throw redirect(302, authUrl);
};
