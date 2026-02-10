import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
    const session = cookies.get('session');
    const origin = url.origin;

    return {
        apiKey: session || '',
        origin
    };
};
