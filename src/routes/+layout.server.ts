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
    return pathname === '/'
        || pathname.startsWith('/user')
        || pathname.startsWith('/auth')
        || pathname.startsWith('/login')
        || pathname.startsWith('/signin')
        || pathname.startsWith('/signout');
}

export const load: LayoutServerLoad = async (event) => {
    let userData: UserInfo | null = null;
    let caller: CallerInfo | null = null;

    try {
        const me = await fetchMe(event.fetch);

        if (me) {
            caller = toCaller(me);
            // Only treat as logged in when the backend recognizes the bearer token (returns sub).
            // A valid Auth.js cookie with an unrecognized/expired OIDC token still gets a public
            // /users/me stub — that must not count as an authenticated MOSS user.
            if (me.sub) {
                userData = me;
            }
        }

        if (userData?.sub && !userData.username?.trim() && !isUsernameSetupExempt(event.url.pathname)) {
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
