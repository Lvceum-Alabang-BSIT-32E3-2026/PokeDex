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

// Standardized Fetch Helper from dev-frontend
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
        generation?: number | string,
        type?: string,
        search?: string
    ): Promise<PokemonListResponse> {
        if (!USE_LIVE_API) {
            let data = [...MOCK_POKEMON];

            if (type && type !== 'all') {
                data = data.filter(p => p.types.includes(type));
            }
            if (generation && generation !== 'all') {
                const genNum = Number(generation);
                if (genNum === 1) data = data.filter(p => p.id <= 151);
                // Add more generation logic as needed
            }
            if (search) {
                data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
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
            ...(generation && generation !== 'all' && { generation: String(generation) }),
            ...(type && type !== 'all' && { type }),
            ...(search && { search })
        });

        const response = await apiFetch(`${API_URL}/api/pokemon?${params}`);
        const data = await response.json();

        // If the API returns a raw array instead of a Paginated Response, 
        // we wrap it to maintain compatibility with the CMS UI
        if (Array.isArray(data)) {
            return {
                items: data.map(p => ({
                    ...p,
                    // Ensure image field is mapped if API uses 'type' string vs 'types' array
                    types: p.type ? p.type.split(',').map((t: string) => t.trim().toLowerCase()) : p.types,
                    image: p.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
                })),
                totalCount: data.length,
                page: 1,
                pageSize: data.length
            };
        }
        return data;
    },

    async getById(id: number): Promise<Pokemon> {
        if (!USE_LIVE_API) {
            const p = MOCK_POKEMON.find(p => p.id === id);
            if (!p) throw new Error('Pokemon not found');
            return p as unknown as Pokemon;
        }
        const response = await apiFetch(`${API_URL}/api/pokemon/${id}`);
        return response.json();
    },

    async getEvolutionChain(pokemonId: number): Promise<EvolutionNode[]> {
        if (!USE_LIVE_API) {
            return MOCK_EVOLUTION_CHAINS[pokemonId] || MOCK_EVOLUTION_CHAINS[1] || [];
        }
        try {
            // Priority: Try our custom backend endpoint first
            const response = await apiFetch(`${API_URL}/api/pokemon/${pokemonId}/evolutions`);
            return response.json();
        } catch (error) {
            // Fallback: PokeAPI direct (Logic from task-235)
            const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
            const speciesData = await speciesRes.json();
            const evoRes = await fetch(speciesData.evolution_chain.url);
            const evoData = await evoRes.json();

            const chain: EvolutionNode[] = [];
            let current = evoData.chain;

            const getArt = (url: string) => {
                const id = url.split('/').filter(Boolean).pop();
                return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
            };

            while (current) {
                const details = current.evolution_details[0];
                chain.push({
                    species_name: current.species.name,
                    min_level: details?.min_level || 0,
                    trigger_name: details?.trigger?.name,
                    item: details?.item?.name,
                    image: getArt(current.species.url)
                });
                current = current.evolves_to[0];
            }
            return chain;
        }
    },

    async createPokemon(data: Partial<Pokemon>): Promise<Pokemon> {
        if (!USE_LIVE_API) {
            const newPokemon = { ...data, id: Date.now() } as unknown as Pokemon;
            MOCK_POKEMON.push(newPokemon as any);
            return newPokemon;
        }
        const response = await apiFetch(`${API_URL}/api/pokemon`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async updatePokemon(id: number, data: Partial<Pokemon>): Promise<Pokemon> {
        if (!USE_LIVE_API) return { ...data, id } as Pokemon;
        
        const response = await apiFetch(`${API_URL}/api/pokemon/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async deletePokemon(id: number): Promise<void> {
        if (!USE_LIVE_API) return;
        await apiFetch(`${API_URL}/api/pokemon/${id}`, { method: 'DELETE' });
    }
};