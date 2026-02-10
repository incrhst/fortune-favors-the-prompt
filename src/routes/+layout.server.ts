import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, cookies }: { locals: any, cookies: any }) => {
    return {
        user: locals.user ? {
            id: locals.user.id,
            username: locals.user.username
        } : null,
        sessionKey: cookies.get('session')
    };
};
