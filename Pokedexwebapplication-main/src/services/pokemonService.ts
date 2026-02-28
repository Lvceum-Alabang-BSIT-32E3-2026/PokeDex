import { apiFetch } from '../utils/api';
import { Pokemon, PokemonListResponse } from '../types/pokemon';

const API_URL = import.meta.env.VITE_API_URL;

export interface EvolutionNode {
    species_name: string;
    min_level: number;
    trigger_name?: string;
    item?: string | null;
    image: string;
}

const assertOk = async (response: Response, fallback: string) => {
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as { message?: string }).message;
        throw new Error(message || fallback);
    }
};

export const pokemonService = {
    async getList(
        offset: number = 0,
        limit: number = 20,
        generation?: number | string,
        type?: string,
        search?: string
    ): Promise<PokemonListResponse> {
        const params = new URLSearchParams({
            offset: String(offset),
            limit: String(limit),
            ...(generation && generation !== 'all' ? { generation: String(generation) } : {}),
            ...(type && type !== 'all' ? { type } : {}),
            ...(search ? { search } : {}),
        });

        const response = await apiFetch(`${API_URL}/api/pokemon?${params}`);
        await assertOk(response, 'Failed to load Pokémon');
        return response.json();
    },

    async getById(id: number): Promise<Pokemon> {
        const response = await apiFetch(`${API_URL}/api/pokemon/${id}`);
        await assertOk(response, 'Pokémon not found');
        return response.json();
    },

    async getEvolutionChain(pokemonId: number): Promise<EvolutionNode[]> {
        const response = await apiFetch(`${API_URL}/api/pokemon/${pokemonId}/evolutions`);
        await assertOk(response, 'Failed to load evolution');
        return response.json();
    },

    async createPokemon(data: Partial<Pokemon>): Promise<Pokemon> {
        const response = await apiFetch(`${API_URL}/api/pokemon`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        await assertOk(response, 'Failed to create Pokémon');
        return response.json();
    },

    async updatePokemon(id: number, data: Partial<Pokemon>): Promise<Pokemon> {
        const response = await apiFetch(`${API_URL}/api/pokemon/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        await assertOk(response, 'Failed to update Pokémon');
        return response.json();
    },

    async deletePokemon(id: number): Promise<void> {
        const response = await apiFetch(`${API_URL}/api/pokemon/${id}`, { method: 'DELETE' });
        await assertOk(response, 'Failed to delete Pokémon');
    },

    async getAllRaw(): Promise<Pokemon[]> {
        try {
            const response = await apiFetch(`${API_URL}/api/pokemon/all`);
            await assertOk(response, 'Failed to load Pokémon');
            return response.json();
        } catch (error) {
            console.error('Error fetching all raw data:', error);
            return [];
        }
    },
};