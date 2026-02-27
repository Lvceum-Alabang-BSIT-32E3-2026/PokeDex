import { MOCK_POKEMON, MOCK_EVOLUTION_CHAINS } from './mockData';
import { Pokemon, PokemonListResponse } from '../types/pokemon';

const API_URL = import.meta.env.VITE_API_URL;
const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';

export interface EvolutionNode {
    species_name: string;
    min_level: number;
    trigger_name?: string;
    item?: string | null;
    image: string;
}

// ── Helper to centralize Auth and Error Handling ──
const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API fetch failed: ${response.status}`);
    }
    return response;
};

export const pokemonService = {
    async getList(
        offset: number = 0,
        limit: number = 20,
        genFilter: string | number = 'all',
        typeFilter: string = 'all',
        search: string = ''
    ): Promise<PokemonListResponse> {
        if (!USE_LIVE_API) {
            console.log('Using Mock Data for List');
            let data = [...MOCK_POKEMON];

            if (search) {
                data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
            }
            if (typeFilter !== 'all') {
                data = data.filter(p => p.types.includes(typeFilter));
            }
            if (genFilter !== 'all') {
                if (genFilter === '1' || genFilter === 1) data = data.filter(p => p.id <= 151);
            }

            return {
                items: data.slice(offset, offset + limit) as unknown as Pokemon[],
                totalCount: data.length,
                page: Math.floor(offset / limit) + 1,
                pageSize: limit
            };
        }

        const params = new URLSearchParams({
            offset: String(offset),
            limit: String(limit),
            ...(genFilter !== 'all' && { generation: String(genFilter) }),
            ...(typeFilter !== 'all' && { type: typeFilter }),
            ...(search && { search })
        });

        const res = await apiFetch(`${API_URL}/api/pokemon?${params.toString()}`);
        return res.json();
    },

    async getById(id: number): Promise<Pokemon> {
        if (!USE_LIVE_API) {
            const p = MOCK_POKEMON.find(p => p.id === id);
            if (!p) throw new Error('Pokemon not found in mock data');
            return p as unknown as Pokemon;
        }
        const res = await apiFetch(`${API_URL}/api/pokemon/${id}`);
        return res.json();
    },

    async createPokemon(data: Partial<Pokemon>): Promise<Pokemon> {
        if (!USE_LIVE_API) {
            const newPokemon = { ...data, id: Date.now() } as unknown as Pokemon;
            return newPokemon;
        }
        const res = await apiFetch(`${API_URL}/api/pokemon`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async updatePokemon(id: number, data: Partial<Pokemon>): Promise<Pokemon> {
        if (!USE_LIVE_API) {
            return { ...data, id } as unknown as Pokemon;
        }
        const res = await apiFetch(`${API_URL}/api/pokemon/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async deletePokemon(id: number): Promise<void> {
        if (!USE_LIVE_API) {
            console.log('Mock: Deleted ID', id);
            return;
        }
        await apiFetch(`${API_URL}/api/pokemon/${id}`, {
            method: 'DELETE',
        });
    },

    async getEvolutionChain(pokemonId: number): Promise<EvolutionNode[]> {
        if (!USE_LIVE_API) {
            return MOCK_EVOLUTION_CHAINS[pokemonId] || MOCK_EVOLUTION_CHAINS[1] || [];
        }

        try {
            const res = await apiFetch(`${API_URL}/api/pokemon/${pokemonId}/evolutions`);
            return res.json();
        } catch (error) {
            console.error('Evolution API Error:', error);
            return [];
        }
    }
};