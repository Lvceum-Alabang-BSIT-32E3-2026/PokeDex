// src/utils/api.ts
export async function apiFetch(
    url: string,
    options: RequestInit = {}
): Promise<any> {
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    // Automatically handle 401 Unauthorized
    if (response.status === 401) {
        // Remove token from localStorage
        localStorage.removeItem('token');

        // Dispatch global logout event
        window.dispatchEvent(
            new CustomEvent('logout', { detail: { reason: 'Session expired' } })
        );
    }

    // Parse JSON if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return { ...data, status: response.status };
    }

    return response;
}