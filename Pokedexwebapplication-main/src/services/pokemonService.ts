import { MOCK_POKEMON, MOCK_EVOLUTION_CHAINS } from './mockData';

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

export interface BaseStat {
  name: string;
  value: number;
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
  async getList(offset: number = 0, limit: number = 20, genFilter: string = 'all', typeFilter: string = 'all') {
    if (!USE_LIVE_API) {
      // Mock Implementation
      console.log('Using Mock Data for List');
      let data = [...MOCK_POKEMON];

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
      // Only send offset/limit when no filters are active (pagination mode)
      if (genFilter === 'all' && typeFilter === 'all') {
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

  async getBaseStats(pokemonId: number): Promise<BaseStat[]> {
    const MOCK_STATS: Record<number, BaseStat[]> = {
      1: [{ name: 'HP', value: 45 }, { name: 'Attack', value: 49 }, { name: 'Defense', value: 49 }, { name: 'Sp. Atk', value: 65 }, { name: 'Sp. Def', value: 65 }, { name: 'Speed', value: 45 }],
      4: [{ name: 'HP', value: 39 }, { name: 'Attack', value: 52 }, { name: 'Defense', value: 43 }, { name: 'Sp. Atk', value: 60 }, { name: 'Sp. Def', value: 50 }, { name: 'Speed', value: 65 }],
      6: [{ name: 'HP', value: 78 }, { name: 'Attack', value: 84 }, { name: 'Defense', value: 78 }, { name: 'Sp. Atk', value: 109 }, { name: 'Sp. Def', value: 85 }, { name: 'Speed', value: 100 }],
      7: [{ name: 'HP', value: 44 }, { name: 'Attack', value: 48 }, { name: 'Defense', value: 65 }, { name: 'Sp. Atk', value: 50 }, { name: 'Sp. Def', value: 64 }, { name: 'Speed', value: 43 }],
      25: [{ name: 'HP', value: 35 }, { name: 'Attack', value: 55 }, { name: 'Defense', value: 40 }, { name: 'Sp. Atk', value: 50 }, { name: 'Sp. Def', value: 50 }, { name: 'Speed', value: 90 }],
      39: [{ name: 'HP', value: 115 }, { name: 'Attack', value: 45 }, { name: 'Defense', value: 20 }, { name: 'Sp. Atk', value: 45 }, { name: 'Sp. Def', value: 25 }, { name: 'Speed', value: 20 }],
      94: [{ name: 'HP', value: 60 }, { name: 'Attack', value: 65 }, { name: 'Defense', value: 60 }, { name: 'Sp. Atk', value: 130 }, { name: 'Sp. Def', value: 75 }, { name: 'Speed', value: 110 }],
      133: [{ name: 'HP', value: 55 }, { name: 'Attack', value: 55 }, { name: 'Defense', value: 50 }, { name: 'Sp. Atk', value: 45 }, { name: 'Sp. Def', value: 65 }, { name: 'Speed', value: 55 }],
      143: [{ name: 'HP', value: 160 }, { name: 'Attack', value: 110 }, { name: 'Defense', value: 65 }, { name: 'Sp. Atk', value: 65 }, { name: 'Sp. Def', value: 110 }, { name: 'Speed', value: 30 }],
      150: [{ name: 'HP', value: 106 }, { name: 'Attack', value: 110 }, { name: 'Defense', value: 90 }, { name: 'Sp. Atk', value: 154 }, { name: 'Sp. Def', value: 90 }, { name: 'Speed', value: 130 }],
    };
    const DEFAULT_STATS: BaseStat[] = [
      { name: 'HP', value: 50 }, { name: 'Attack', value: 50 }, { name: 'Defense', value: 50 },
      { name: 'Sp. Atk', value: 50 }, { name: 'Sp. Def', value: 50 }, { name: 'Speed', value: 50 },
    ];

    if (!USE_LIVE_API) {
      return MOCK_STATS[pokemonId] ?? DEFAULT_STATS;
    }

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`);
      const data = await res.json();
      const statNameMap: Record<string, string> = {
        'hp': 'HP',
        'attack': 'Attack',
        'defense': 'Defense',
        'special-attack': 'Sp. Atk',
        'special-defense': 'Sp. Def',
        'speed': 'Speed',
      };
      return data.stats
        .filter((s: any) => statNameMap[s.stat.name] !== undefined)
        .map((s: any) => ({ name: statNameMap[s.stat.name], value: s.base_stat }));
    } catch (error) {
      console.error('Stats API Error:', error);
      return DEFAULT_STATS;
    }
  },

  async deletePokemon(id: number): Promise<void> {
    if (!USE_LIVE_API) {
      // Mock: just log
      console.log('Mock: deletePokemon called for id', id);
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
