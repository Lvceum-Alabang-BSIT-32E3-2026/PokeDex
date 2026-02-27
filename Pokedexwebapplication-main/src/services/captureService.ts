const API_URL = import.meta.env.VITE_API_URL || '/api';
const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = (errorBody && errorBody.message) || response.statusText;
        throw new Error(message || 'Capture API request failed');
    }
    return response;
};

export const captureService = {
    async list(): Promise<number[]> {
        if (!USE_LIVE_API) {
            const saved = localStorage.getItem('capturedPokemon');
            return saved ? JSON.parse(saved) : [];
        }

        const response = await handleResponse(
            await fetch(`${API_URL}/api/captures`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            })
        );

        const data = await response.json();
        if (Array.isArray(data)) {
            return data;
        }
        if (Array.isArray(data?.items)) {
            return data.items;
        }
        if (Array.isArray(data?.pokemonIds)) {
            return data.pokemonIds;
        }
        return [];
    },

    async capture(id: number): Promise<void> {
        if (!USE_LIVE_API) {
            const current = new Set<number>(JSON.parse(localStorage.getItem('capturedPokemon') || '[]'));
            current.add(id);
            localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(current)));
            return;
        }

        await handleResponse(
            await fetch(`${API_URL}/api/captures/${id}`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders()
                }
            })
        );
    },

    async release(id: number): Promise<void> {
        if (!USE_LIVE_API) {
            const current = new Set<number>(JSON.parse(localStorage.getItem('capturedPokemon') || '[]'));
            current.delete(id);
            localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(current)));
            return;
        }

        await handleResponse(
            await fetch(`${API_URL}/api/captures/${id}`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeaders()
                }
            })
        );
    }
};
