import type { RequestHandler } from "./$types";

// Assuming your RequestHandler type expects an event parameter
export const POST: RequestHandler = async ({ request, locals, fetch }) => {
    try {

        const session = await locals.auth() as any;
        // console.log(session);

        if (session == null || session.user == undefined) {
            return new Response(null, { status: 401, statusText: "Unauthorized" });
        }

        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${session.accessToken}`);

        const requestOptions: RequestInit = {
            method: request.method,
            headers: {
                ...request.headers,
                Authorization: `Bearer ${session.accessToken}`, 
            },
            body: request.body, 
            // @ts-ignore
            duplex: 'half',
        };

        let url = request.url;
        url = url.replace("/cmd/", "/api/");

        console.log("making request to " + url);
        // console.log(requestOptions);

        const fetchResponse = await fetch(url, requestOptions);

        // Create a new response with the parameters of the fetch response
        const response = new Response(fetchResponse.body, {
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            headers: fetchResponse.headers
        });

        // console.log(response);
        return response;

    } catch(err : any) {
        console.log("error HEREEEEE");
        console.log(err);
        return new Response("Error", { status: 500, statusText: err.message });
    }
}