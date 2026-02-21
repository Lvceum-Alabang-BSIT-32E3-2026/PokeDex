// src/utils/api.ts

export async function apiFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Merge headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers, // Allows overriding defaults
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Handle 401 Unauthorized
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:logout'));
        }

        return response;
    } catch (error) {
        // Optional: handle network errors
        console.error('API Fetch Error:', error);
        throw error;
    }
}