import { env } from '$env/dynamic/private';
import { env as ENV } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';
import jwt from 'jsonwebtoken';

async function fetchUserData(session: any) {

    if (session == null || session.user == undefined) {
        return null;
    }

    const accessToken = session.accessToken;

    const headers: any = {
        Accept: 'application/json',
        Authorization: 'Bearer ' + accessToken
    };

    let response = await fetch(`${ENV.PUBLIC_MOSS_BASE_URL}/api/users/get-user`, {
        method: "GET",
        headers: headers,
    });

    console.log(JSON.stringify(response, null, 3));

    if (response.ok) {
        const data = await response.json();
        return data;
    }

    console.log("nix user");
    return null;
}

export const load: LayoutServerLoad = async (event) => {

    let userData = null;
    console.log(`Fetching user data....`);

    try {
        const session = await event.locals.auth() as any;

        console.log(JSON.stringify(session, null, 3));
        userData = await fetchUserData(session);

        // userData.isAdmin now comes from backend API, no local role check here

    } catch (error) {
        console.error("Error fetching user data:", error);
    }

    console.log(JSON.stringify(userData, null, 3));

    return {
        userData: userData
    };
};
