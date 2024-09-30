/*
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public'

export async function GET(event) {
    const { params, request } = event; // Destructure params and request from event

    var url = new URL(request.url);

    // Specify the target URL for the proxy
    const targetUrl = `${env.PUBLIC_MOSS_BASE_URL}${url.pathname}${url.search}`; // Replace with your target server URL

    try {

        console.log(`Proxying to: ${targetUrl}`);
        
        // Create a new request with the same method, body, and headers
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: request.headers,
        });
        
        // Return the response from the target server
        const responseBody = await response.blob(); // You can use .json() if the response is in JSON format

        return new Response(responseBody, {
            status: response.status,
            headers: {
                // Forward response headers if needed
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
            }
        });

    } catch (err) {
        console.error('Error during proxying:', err);
        throw error(500, 'Internal Server Error'); // Handle errors
    }
}

export async function POST(event) {
    const { params, request } = event; // Destructure params and request from event

    var url = new URL(request.url);

    // Specify the target URL for the proxy
    const targetUrl = `${env.PUBLIC_MOSS_BASE_URL}${url.pathname}${url.search}`; // Replace with your target server URL

    try {

        console.log(`Proxying to: ${targetUrl}`);
        
        // Create a new request with the same method, body, and headers
        const response = await fetch(targetUrl, {
            method: 'POST',
            body: await request.blob(), // Forward the request body
            headers: request.headers,
        });
        
        // Return the response from the target server
        const responseBody = await response.text(); // You can use .json() if the response is in JSON format
        return new Response(responseBody, {
            status: response.status,
            headers: {
                // Forward response headers if needed
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
            }
        });
    } catch (err) {
        console.error('Error during proxying:', err);
        throw error(500, 'Internal Server Error'); // Handle errors
    }
}
    */