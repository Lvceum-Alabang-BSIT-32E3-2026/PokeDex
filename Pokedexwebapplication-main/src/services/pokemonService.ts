import { MOCK_POKEMON, MOCK_EVOLUTION_CHAINS } from './mockData';

const API_URL = import.meta.env.VITE_API_URL;
const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  image: string;
  url?: string;
  height?: number;
  weight?: number;
}

export interface PokemonListResponse {
  data: Pokemon[];
  totalCount: number;
}

export interface EvolutionNode {
  species_name: string;
  min_level: number;
  trigger_name?: string;
  item?: string | null;
  image: string;
}

// Helper to add Authorization header
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API fetch failed: ${response.statusText}`);
  }
  return response;
};

export const pokemonService = {
  async getList(
    offset: number = 0,
    limit: number = 20,
    generation?: number,
    type?: string,
    search?: string
  ): Promise<PokemonListResponse> {
    if (!USE_LIVE_API) {
      // Mock Implementation
      console.log('Using Mock Data for List');
      let data = [...MOCK_POKEMON];

      if (type && type !== 'all') {
        data = data.filter(p => p.types.includes(type));
      }

      if (generation) {
        if (generation === 1) data = data.filter(p => p.id <= 151);
      }

      if (search) {
        data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }

      return {
        data: data.slice(offset, offset + limit),
        totalCount: data.length
      };
    }

    const params = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
      ...(generation && { generation: String(generation) }),
      ...((type && type !== 'all') && { type }),
      ...(search && { search })
    });

    const response = await apiFetch(`${API_URL}/api/pokemon?${params}`);
    return response.json();
  },

  async getById(id: number): Promise<Pokemon> {
    if (!USE_LIVE_API) {
      const p = MOCK_POKEMON.find(p => p.id === id);
      if (!p) throw new Error('Not found');
      return p;
    }
    const response = await apiFetch(`${API_URL}/api/pokemon/${id}`);
    return response.json();
  },

  async getEvolutionChain(pokemonId: number): Promise<EvolutionNode[]> {
    if (!USE_LIVE_API) {
      if (MOCK_EVOLUTION_CHAINS[pokemonId]) return MOCK_EVOLUTION_CHAINS[pokemonId];
      if (MOCK_EVOLUTION_CHAINS[1]) return MOCK_EVOLUTION_CHAINS[1];
      return [];
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
      MOCK_POKEMON.push(newPokemon);
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
      return { ...data, id } as Pokemon;
    }
    const response = await apiFetch(`${API_URL}/api/pokemon/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deletePokemon(id: number): Promise<void> {
    if (!USE_LIVE_API) {
      return;
    }
    await apiFetch(`${API_URL}/api/pokemon/${id}`, {
      method: 'DELETE'
    });
  }
};
