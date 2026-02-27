export interface Pokemon {
  id: number;
  pokedexNumber: number;
  name: string;
  imageUrl: string;
  types: string[];
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
  isCaptured?: boolean;

  // Stats (optional, for detail view)
  hp?: number;
  attack?: number;
  defense?: number;
  specialAttack?: number;
  specialDefense?: number;
  speed?: number;
  height?: number;
  weight?: number;
}

export interface PokemonListResponse {
  items: Pokemon[];
  totalCount: number;
  page: number;
  pageSize: number;
}
