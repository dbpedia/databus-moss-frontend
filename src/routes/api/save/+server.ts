import type { RequestHandler } from "./$types";

// Assuming your RequestHandler type expects an event parameter
export const POST: RequestHandler = async (event) => {
    try {

        let request : Request = event.request;
        const session = await event.locals.auth() as any;
        console.log(session);

        if (session.user == undefined) {
        return new Response(null, { status: 401, statusText: "Unauthorized" });
        }

        const requestOptions: RequestInit = {
            method: request.method,
            headers: {
                ...request.headers,
                Authorization: `Bearer ${session.accessToken}`, // Example of authorization header
            },
            body: request.body, // Replace with your request body
        };
        
        
        console.log("making request to " + request.url);
        console.log(requestOptions);
        
        return await fetch(request.url, requestOptions);

    } catch(err : any) {
        return new Response("Error", { status: 500, statusText: err.message });
    }
}