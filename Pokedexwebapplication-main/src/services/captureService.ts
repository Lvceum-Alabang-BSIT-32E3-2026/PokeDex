const API_BASE = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const captureService = {
  async getCaptures(): Promise<number[]> {
    const response = await fetch(`${API_BASE}/api/captures`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch captures.');
    }

    return response.json();
  },

  async capture(pokemonId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/captures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ pokemonId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to capture Pokémon.');
    }
  },

  async release(pokemonId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/captures/${pokemonId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to release Pokémon.');
    }
  },
};
