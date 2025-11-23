// src/routes/terminologies/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const res = await fetch('/terminologies', {
        headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
        throw new Error(`Failed to load terminologies: ${res.status}`);
    }

    const data = await res.json();
    return {
        terminologies: data._embedded?.terminologies ?? []
    };
};
