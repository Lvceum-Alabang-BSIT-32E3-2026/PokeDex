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

    // Live API Implementation
    try {
      let results = [];

      if (genFilter !== 'all') {
        const res = await fetch(`https://pokeapi.co/api/v2/generation/${genFilter}`);
        const data = await res.json();
        // Process species to get proper IDs for sorting/fetching
        results = data.pokemon_species.map((s: any) => {
          const id = parseInt(s.url.split('/').filter(Boolean).pop());
          return {
            name: s.name,
            url: `https://pokeapi.co/api/v2/pokemon/${id}`,
            id: id
          };
        }).sort((a: any, b: any) => a.id - b.id);

        // Pagination for Gen view (client side slice for now)
        // results = results.slice(offset, offset + limit);

      } else if (typeFilter !== 'all') {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${typeFilter}`);
        const data = await res.json();
        results = data.pokemon.map((p: any) => p.pokemon);
      } else {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await res.json();
        results = data.results;
      }

      // If we have a huge list (Gen/Type filters), we slice it for the view here
      // For standard pagination, 'results' is already chunked.
      const viewResults = (genFilter !== 'all' || typeFilter !== 'all')
        ? results.slice(0, 50)
        : results;

      // Fetch details for each
      const detailed = await Promise.all(
        viewResults.map(async (p: any) => {
          let url = p.url;
          if (!url && p.pokemon) url = p.pokemon.url;

          const res = await fetch(url);
          const details = await res.json();
          return formatApiPokemon(details);
        })
      );

      return detailed;
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
