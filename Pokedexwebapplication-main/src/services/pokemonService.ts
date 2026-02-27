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
    'Content-Type': 'application/json',
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
      console.log('Using Mock Data for List');
      let data = [...MOCK_POKEMON];

      if (type && type !== 'all') {
        data = data.filter(p => p.types.includes(type));
      }

      if (generation && generation !== 'all') {
        if (Number(generation) === 1) data = data.filter(p => p.id <= 151);
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
      const response = await apiFetch(`${API_URL}/api/pokemon/${pokemonId}/evolutions`);
      return response.json();
    } catch (error) {
      console.error('Evo API Error:', error);
      return [];
    }
  },

  async createPokemon(data: Partial<Pokemon>): Promise<Pokemon> {
    if (!USE_LIVE_API) {
      const newPokemon = { ...data, id: Date.now() } as Pokemon;
      return newPokemon;
    }
    const response = await apiFetch(`${API_URL}/api/pokemon`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updatePokemon(id: number, data: Partial<Pokemon>): Promise<Pokemon> {
    if (!USE_LIVE_API) {
      return { ...data, id } as Pokemon;
    }
    const response = await apiFetch(`${API_URL}/api/pokemon/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deletePokemon(id: number): Promise<void> {
    if (!USE_LIVE_API) return;
    await apiFetch(`${API_URL}/api/pokemon/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Task 3.2.5: Fetches all pokemon without pagination for type breakdown analytics.
   */
  async getAllRaw(): Promise<Pokemon[]> {
    if (!USE_LIVE_API) {
      return MOCK_POKEMON as unknown as Pokemon[];
    }
    try {
      const response = await apiFetch(`${API_URL}/api/pokemon/all`); // Assumes an 'all' endpoint exists or adjust to list with high limit
      return response.json();
    } catch (error) {
      console.error('Error fetching all raw data:', error);
      return [];
    }
  }
};