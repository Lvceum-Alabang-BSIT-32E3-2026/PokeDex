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

/* ---------- HELPER ---------- */
// Centralized fetch with Auth token and error handling
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API fetch failed: ${response.statusText}`);
  }
  return response;
};

/* ---------- SERVICE ---------- */
export const pokemonService = {
  
  /**
   * Fetch a paginated list of Pokemon with filters
   */
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

      if (generation) {
        // Simple logic for Gen 1 mock data
        if (generation === 1) data = data.filter(p => p.id <= 151);
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

  /**
   * Fetch a single Pokemon by ID
   */
  async getById(id: number): Promise<Pokemon> {
    if (!USE_LIVE_API) {
      const p = MOCK_POKEMON.find(p => p.id === id);
      if (!p) throw new Error('Pokemon not found in mock data');
      return p as unknown as Pokemon;
    }
    const response = await apiFetch(`${API_URL}/api/pokemon/${id}`);
    return response.json();
  },

  /**
   * Get the evolution chain for a specific Pokemon
   */
  async getEvolutionChain(pokemonId: number): Promise<EvolutionNode[]> {
    if (!USE_LIVE_API) {
      return MOCK_EVOLUTION_CHAINS[pokemonId] || MOCK_EVOLUTION_CHAINS[1] || [];
    }
    
    try {
      // Assuming your backend has a dedicated endpoint for evolutions
      const response = await apiFetch(`${API_URL}/api/pokemon/${pokemonId}/evolutions`);
      return response.json();
    } catch (error) {
      console.error('Evolution API Error:', error);
      return [];
    }
  },

  /**
   * Create a new Pokemon entry
   */
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

  /**
   * Update an existing Pokemon
   */
  async updatePokemon(id: number, data: Partial<Pokemon>): Promise<Pokemon> {
    if (!USE_LIVE_API) {
      return { ...data, id } as unknown as Pokemon;
    }
    const response = await apiFetch(`${API_URL}/api/pokemon/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * Delete a Pokemon
   */
  async deletePokemon(id: number): Promise<void> {
    if (!USE_LIVE_API) return;
    
    await apiFetch(`${API_URL}/api/pokemon/${id}`, {
      method: 'DELETE'
    });
  }
};