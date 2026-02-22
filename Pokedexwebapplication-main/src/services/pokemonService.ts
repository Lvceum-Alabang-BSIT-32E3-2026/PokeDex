import { MOCK_POKEMON, MOCK_EVOLUTION_CHAINS, deleteMockPokemon } from './mockData';

const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';
const API_BASE = import.meta.env.VITE_API_URL || '';

export interface Pokemon {
    id: number;
    name: string;
    types: string[];
    image: string;
    url?: string;
    height?: number; // Mula sa Task 2.3.3
    weight?: number; // Mula sa Task 2.3.3
}

export interface EvolutionNode {
    species_name: string;
    min_level: number;
    trigger_name?: string;
    item?: string | null;
    image: string;
}

export const pokemonService = {
    async getList(offset: number = 0, limit: number = 20, genFilter: string = 'all', typeFilter: string = 'all', search: string = '') {
        if (!USE_LIVE_API) {
            let data = [...MOCK_POKEMON];
            if (search) data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
            if (typeFilter !== 'all') data = data.filter(p => p.types.includes(typeFilter));
            if (genFilter === '1') data = data.filter(p => p.id <= 151);
            return data.slice(offset, offset + limit);
        }

        try {
            const params = new URLSearchParams();
            if (genFilter !== 'all') params.append('generation', genFilter);
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (search) params.append('search', search);
            params.append('offset', String(offset));
            params.append('limit', String(limit));

            const res = await fetch(`/api/pokemons?${params.toString()}`);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data: any[] = await res.json();

            return data.map((p) => ({
                id: p.id,
                name: p.name,
                types: p.type ? p.type.split(',').map((t: string) => t.trim().toLowerCase()) : [],
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
            }));
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    async createPokemon(data: { name: string; types: string[]; image: string }): Promise<Pokemon> {
        const response = await fetch('/api/pokemon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Request failed with status ${response.status}`);
        }
        return response.json();
    },

    async getEvolutionChain(pokemonId: number): Promise<EvolutionNode[]> {
        if (!USE_LIVE_API) {
            return MOCK_EVOLUTION_CHAINS[pokemonId] || MOCK_EVOLUTION_CHAINS[1] || [];
        }

        try {
            const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
            const speciesData = await speciesRes.json();
            const evoRes = await fetch(speciesData.evolution_chain.url);
            const evoData = await evoRes.json();

            const chain: EvolutionNode[] = [];
            let current = evoData.chain;

            const getImage = (speciesUrl: string) => {
                const id = speciesUrl.split('/').filter(Boolean).pop();
                return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
            };

            do {
                const details = current.evolution_details[0];
                chain.push({
                    species_name: current.species.name,
                    min_level: details?.min_level || 0,
                    trigger_name: details?.trigger?.name,
                    item: details?.item?.name,
                    image: getImage(current.species.url)
                });
                current = current.evolves_to[0];
            } while (current && current.hasOwnProperty('evolves_to'));

            return chain;
        } catch (error) {
            console.error('Evo API Error:', error);
            return [];
        }
    },

    async deletePokemon(id: number): Promise<void> {
        if (!USE_LIVE_API) {
            console.log('Mock: deletePokemon called for id', id);
            deleteMockPokemon(id); // Importante ito para sa persistent mock delete
            return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/pokemon/${id}`, {
            method: 'DELETE',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete Pokémon.');
        }
    },

    async updatePokemon(id: number, data: Partial<Pokemon>): Promise<Pokemon> {
        if (!USE_LIVE_API) {
            return { id, name: data.name || '', types: data.types || [], image: data.image || '' };
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/pokemon/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update Pokémon.');
        }
        return response.json();
    },

    async getAllRaw(): Promise<Pokemon[]> {
        if (!USE_LIVE_API) return MOCK_POKEMON;
        try {
            const res = await fetch(`/api/pokemons`);
            const data: any[] = await res.json();
            return data.map((p) => ({
                id: p.id,
                name: p.name,
                types: p.type ? p.type.split(',').map((t: string) => t.trim().toLowerCase()) : [],
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
            }));
        } catch (error) {
            console.error('Error fetching all raw data:', error);
            return [];
        }
    }
};