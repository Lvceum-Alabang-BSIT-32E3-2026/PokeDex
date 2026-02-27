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

// Helper to add Authorization header and handle basic errors
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
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
        // Add more generation logic if needed for mock data
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
    return response.json();
  },

  async getById(id: number): Promise<Pokemon> {
    if (!USE_LIVE_API) {
      const p = MOCK_POKEMON.find(p => p.id === id);
      if (!p) throw new Error('Not found');
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
      // Trying the internal API first (from dev-frontend)
      const response = await apiFetch(`${API_URL}/api/pokemon/${pokemonId}/evolutions`);
      return response.json();
    } catch (error) {
      console.warn('Internal Evo API failed, falling back to PokeAPI wrapper logic');
      
      // Fallback logic from task-233 if the internal backend endpoint isn't ready
      const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
      const speciesData = await speciesRes.json();
      const evoRes = await fetch(speciesData.evolution_chain.url);
      const evoData = await evoRes.json();

      const chain: EvolutionNode[] = [];
      let current = evoData.chain;

      const getArtwork = (url: string) => {
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
          image: getArtwork(current.species.url)
        });
        current = current.evolves_to[0];
      } while (current);

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updatePokemon(id: number, data: Partial<Pokemon>): Promise<Pokemon> {
    if (!USE_LIVE_API) {
      return { ...data, id } as unknown as Pokemon;
    }
    const response = await apiFetch(`${API_URL}/api/pokemon/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deletePokemon(id: number): Promise<void> {
    if (!USE_LIVE_API) return;
    await apiFetch(`${API_URL}/api/pokemon/${id}`, {
      method: 'DELETE'
    });
  }
};