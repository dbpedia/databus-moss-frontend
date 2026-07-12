import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { CallerInfo, UserInfo } from '$lib/types';

async function fetchMe(fetch: typeof globalThis.fetch): Promise<UserInfo | null> {
    const response = await fetch('/users/me', {
        method: 'GET',
        headers: { Accept: 'application/json' }
    });

    if (response.ok) {
        return await response.json();
    }

    return null;
}

function toCaller(me: UserInfo): CallerInfo {
    return {
        roles: me.roles,
        permissions: me.permissions
    };
}

function isUsernameSetupExempt(pathname: string): boolean {
    return pathname.startsWith('/user')
        || pathname.startsWith('/auth')
        || pathname.startsWith('/login')
        || pathname.startsWith('/signin')
        || pathname.startsWith('/signout');
}

export const load: LayoutServerLoad = async (event) => {
    let userData: UserInfo | null = null;
    let caller: CallerInfo | null = null;

    try {
        const session = await event.locals.auth() as any;
        const me = await fetchMe(event.fetch);

        if (me) {
            caller = toCaller(me);
            if (session?.user != null) {
                userData = me;
            }
        }

        if (userData && !userData.username?.trim() && !isUsernameSetupExempt(event.url.pathname)) {
            throw redirect(302, '/user');
        }

    } catch (error) {
        if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
            throw error;
        }
        console.error('Error fetching user data:', error);
    }

    return {
        userData,
        caller
    };
};
