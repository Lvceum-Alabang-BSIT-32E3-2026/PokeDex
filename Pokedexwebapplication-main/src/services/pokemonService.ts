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

// Helper to handle Authorization and common fetch logic
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
        throw new Error(errorText || `API fetch failed: ${response.statusText}`);
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
            let data = [...MOCK_POKEMON];

            if (search) {
                data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
            }
            if (typeFilter !== 'all') {
                data = data.filter(p => p.types.includes(typeFilter));
            }
            if (genFilter !== 'all') {
                if (Number(genFilter) === 1) data = data.filter(p => p.id <= 151);
                // Additional generation logic can be added here
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

    async getEvolutionChain(pokemonId: number): Promise<EvolutionNode[]> {
        if (!USE_LIVE_API) {
            return MOCK_EVOLUTION_CHAINS[pokemonId] || MOCK_EVOLUTION_CHAINS[1] || [];
        }

        try {
            // Priority: Internal API for evolutions
            const res = await apiFetch(`${API_URL}/api/pokemon/${pokemonId}/evolutions`);
            return res.json();
        } catch (error) {
            console.error('Evolution API Error, falling back to PokeAPI:', error);
            // Fallback to direct PokeAPI if internal endpoint fails
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

            do {
                const details = current.evolution_details[0];
                chain.push({
                    species_name: current.species.name,
                    min_level: details?.min_level || 0,
                    trigger_name: details?.trigger?.name,
                    item: details?.item?.name,
                    image: getArt(current.species.url)
                });
                current = current.evolves_to[0];
            } while (current);

            return chain;
        }
    },

    async createPokemon(data: Partial<Pokemon>): Promise<Pokemon> {
        if (!USE_LIVE_API) {
            const newPokemon = { ...data, id: Date.now() } as any;
            MOCK_POKEMON.push(newPokemon);
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
            return { ...data, id } as any;
        }
        const res = await apiFetch(`${API_URL}/api/pokemon/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async deletePokemon(id: number): Promise<void> {
        if (!USE_LIVE_API) {
            const index = MOCK_POKEMON.findIndex(p => p.id === id);
            if (index > -1) MOCK_POKEMON.splice(index, 1);
            return;
        }
        await apiFetch(`${API_URL}/api/pokemon/${id}`, {
            method: 'DELETE',
        });
    }
};