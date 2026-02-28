const API_URL = import.meta.env.VITE_API_URL || '';

/** Wrapper around fetch that adds auth header, base URL, and 401 handling. */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('token');
    const isAbsolute = /^https?:\/\//i.test(url);
    const fullUrl = isAbsolute ? url : `${API_URL}${url}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(fullUrl, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:logout'));
    }

    return response;
}