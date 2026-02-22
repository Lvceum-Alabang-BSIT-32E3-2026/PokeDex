import { MOCK_POKEMON, MOCK_EVOLUTION_CHAINS, deleteMockPokemon } from './mockData';

const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';
const API_BASE = import.meta.env.VITE_API_URL || '';

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  image: string;
  url?: string;
}

export interface EvolutionNode {
  species_name: string;
  min_level: number;
  trigger_name?: string;
  item?: string | null;
  image: string;
}

// Helper to clean up API responses
const formatApiPokemon = (p: any): Pokemon => ({
  name: p.name,
  url: p.url,
  id: p.id,
  types: p.types.map((t: any) => t.type.name),
  image: p.sprites.other['official-artwork'].front_default || p.sprites.front_default
});

export const pokemonService = {
  async getList(offset: number = 0, limit: number = 20, genFilter: string = 'all', typeFilter: string = 'all', search: string = '') {
    if (!USE_LIVE_API) {
      // Mock Implementation
      console.log('Using Mock Data for List');
      let data = [...MOCK_POKEMON];

      if (search) {
        data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (typeFilter !== 'all') {
        data = data.filter(p => p.types.includes(typeFilter));
      }

      // Mock generation filter (simplified: Gen 1 is id 1-151)
      if (genFilter !== 'all') {
        if (genFilter === '1') data = data.filter(p => p.id <= 151);
      }

      return data;
    }

    // Live API Implementation — calls our local ResourceApi
    try {
      const params = new URLSearchParams();
      if (genFilter !== 'all') params.append('generation', genFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (search) params.append('search', search);
      
      // Only send offset/limit when no filters are active (pagination mode)
      if (genFilter === 'all' && typeFilter === 'all' && !search) {
        params.append('offset', String(offset));
        params.append('limit', String(limit));
      }

      const res = await fetch(`/api/pokemons?${params.toString()}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: any[] = await res.json();

      // Map ResourceApi shape → frontend Pokemon interface
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        // ResourceApi stores a single comma-separated type string; split into array
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
      // Return specific mock chain if exists, or a default single node
      if (MOCK_EVOLUTION_CHAINS[pokemonId]) return MOCK_EVOLUTION_CHAINS[pokemonId];
      if (MOCK_EVOLUTION_CHAINS[1]) return MOCK_EVOLUTION_CHAINS[1]; // Fallback for demo
      return [];
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
      // Mock: update the mock data array persistently for the session
      console.log('Mock: deletePokemon called for id', id);
      deleteMockPokemon(id);
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
      // Mock: return the merged object immediately
      console.log('Mock: updatePokemon called for id', id, data);
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
  }
};
