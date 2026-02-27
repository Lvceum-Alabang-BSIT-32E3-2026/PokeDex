// Comprehensive mock data for offline mode

export const deleteMockPokemon = (id: number) => {
  MOCK_POKEMON = MOCK_POKEMON.filter(p => p.id !== id);
};

export interface PokemonMock {
  id: number;
  pokedexNumber: number;
  name: string;
  types: string[];
  imageUrl: string;
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
  stats?: { name: string; value: number }[];
  description?: string;
}

export let MOCK_POKEMON: PokemonMock[] = [
  {
    id: 1,
    pokedexNumber: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    generation: 1,
    isLegendary: false,
    isMythical: false,
    description: "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon."
  },
  {
    id: 4,
    pokedexNumber: 4,
    name: "charmander",
    types: ["fire"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    generation: 1,
    isLegendary: false,
    isMythical: false,
    description: "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail."
  },
  {
    id: 7,
    pokedexNumber: 7,
    name: "squirtle",
    types: ["water"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    generation: 1,
    isLegendary: false,
    isMythical: false,
    description: "After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth."
  },
  {
    id: 25,
    pokedexNumber: 25,
    name: "pikachu",
    types: ["electric"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    generation: 1,
    isLegendary: false,
    isMythical: false,
    description: "Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy."
  },
  {
    id: 39,
    pokedexNumber: 39,
    name: "jigglypuff",
    types: ["normal", "fairy"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png",
    generation: 1,
    isLegendary: false,
    isMythical: false,
    description: "Recording... Jigglypuff. By inflating its large stomach, it can sing a mysterious melody."
  },
  {
    id: 143,
    pokedexNumber: 143,
    name: "snorlax",
    types: ["normal"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    generation: 1,
    isLegendary: false,
    isMythical: false,
    description: "It is not satisfied unless it eats over 880 pounds of food every day. It is mostly asleep while eating."
  },
  {
    id: 150,
    pokedexNumber: 150,
    name: "mewtwo",
    types: ["psychic"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    generation: 1,
    isLegendary: true,
    isMythical: false,
    description: "It was created by a scientist after years of horrific gene splicing and DNA engineering experiments."
  },
  {
    id: 133,
    pokedexNumber: 133,
    name: "eevee",
    types: ["normal"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    generation: 1,
    isLegendary: false,
    isMythical: false,
    description: "Its genetic code is irregular. It may mutate if it is exposed to radiation from element STONEs."
  },
  {
    id: 94,
    pokedexNumber: 94,
    name: "gengar",
    types: ["ghost", "poison"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    generation: 1,
    isLegendary: false,
    isMythical: false,
    description: "Under a full moon, this Pokémon likes to mimic the shadows of people and laugh at their fright."
  },
  {
    id: 6,
    pokedexNumber: 6,
    name: "charizard",
    types: ["fire", "flying"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    generation: 1,
    isLegendary: false,
    isMythical: false,
    description: "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally."
  }
];

export const MOCK_EVOLUTION_CHAINS: Record<number, any[]> = {
  1: [
    { species_name: "bulbasaur", min_level: 0, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" },
    { species_name: "ivysaur", min_level: 16, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png" },
    { species_name: "venusaur", min_level: 32, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png" }
  ],
  4: [
    { species_name: "charmander", min_level: 0, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" },
    { species_name: "charmeleon", min_level: 16, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png" },
    { species_name: "charizard", min_level: 36, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" }
  ]
};
