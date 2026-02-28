import { apiFetch } from '../utils/api';

export const captureService = {
  async getCaptures(): Promise<number[]> {
    const response = await apiFetch('/api/captures');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as { message?: string }).message || 'Failed to fetch captures.');
    }
    return response.json();
  },

  async capture(pokemonId: number): Promise<void> {
    const response = await apiFetch('/api/captures', {
      method: 'POST',
      body: JSON.stringify({ pokemonId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as { message?: string }).message || 'Failed to capture Pokémon.');
    }
  },

  async release(pokemonId: number): Promise<void> {
    const response = await apiFetch(`/api/captures/${pokemonId}`, { method: 'DELETE' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as { message?: string }).message || 'Failed to release Pokémon.');
    }
  },
};
