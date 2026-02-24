// src/utils/api.ts

export async function apiFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {

    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Build headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',

        // Automatically add Authorization header if token exists
        ...(token && { Authorization: `Bearer ${token}` }),

        // Allow custom headers to override defaults
        ...options.headers,
    };

    // Execute request
    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle 401 Unauthorized → trigger logout
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:logout'));
    }

    // Return full Response object
    return response;
}