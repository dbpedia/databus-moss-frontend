import type { RequestHandler } from '@sveltejs/kit';

// Assuming your RequestHandler type expects an event parameter
export const GET: RequestHandler = async ({ locals }) => {
    try {
        const session = await locals.auth() as any;

        if (session == null || session.user == undefined) {
            return new Response(null, { status: 401, statusText: "Unauthorized" });
        }

        const accessToken = session.accessToken;

        // Return the access token in the response
        return new Response(JSON.stringify({ accessToken }), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });

    } catch (err: any) {
        return new Response("Error", { status: 500, statusText: err.message });
    }
}
    