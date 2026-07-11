import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { UserInfo } from '$lib/types';

async function fetchUserData(fetch: typeof globalThis.fetch, session: any): Promise<UserInfo | null> {

    if (session == null || session.user == undefined) {
        return null;
    }

    let response = await fetch('/users/me', {
        method: 'GET',
        headers: { Accept: 'application/json' }
    });

    if (response.ok) {
        const data = await response.json();
        return data;
    }

    return null;
}

function isUsernameSetupExempt(pathname: string): boolean {
    return pathname.startsWith('/user')
        || pathname.startsWith('/auth')
        || pathname.startsWith('/login')
        || pathname.startsWith('/signin')
        || pathname.startsWith('/signout');
}

export const load: LayoutServerLoad = async (event) => {

    let userData = null;

    try {
        const session = await event.locals.auth() as any;
        userData = await fetchUserData(event.fetch, session);

        if (userData && !userData.username?.trim() && !isUsernameSetupExempt(event.url.pathname)) {
            throw redirect(302, '/user');
        }

    } catch (error) {
        if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
            throw error;
        }
        console.error("Error fetching user data:", error);
    }
 
    return {
        userData: userData
    };
};
