// Comprehensive mock data for offline mode

export interface PokemonMock {
  id: number;
  name: string;
  types: string[];
  image: string;
  stats?: { name: string; value: number }[];
  description?: string;
}

export const MOCK_POKEMON: PokemonMock[] = [
  {
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    description: "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon."
  },
  {
    id: 4,
    name: "charmander",
    types: ["fire"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    description: "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail."
  },
  {
    id: 7,
    name: "squirtle",
    types: ["water"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    description: "After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth."
  },
  {
    id: 25,
    name: "pikachu",
    types: ["electric"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    description: "Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy."
  },
  {
    id: 39,
    name: "jigglypuff",
    types: ["normal", "fairy"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png",
    description: "Recording... Jigglypuff. By inflating its large stomach, it can sing a mysterious melody."
  },
  {
    id: 143,
    name: "snorlax",
    types: ["normal"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    description: "It is not satisfied unless it eats over 880 pounds of food every day. It is mostly asleep while eating."
  },
  {
    id: 150,
    name: "mewtwo",
    types: ["psychic"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    description: "It was created by a scientist after years of horrific gene splicing and DNA engineering experiments."
  },
  {
    id: 133,
    name: "eevee",
    types: ["normal"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    description: "Its genetic code is irregular. It may mutate if it is exposed to radiation from element STONEs."
  },
  {
    id: 94,
    name: "gengar",
    types: ["ghost", "poison"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    description: "Under a full moon, this Pokémon likes to mimic the shadows of people and laugh at their fright."
  },
  {
    id: 6,
    name: "charizard",
    types: ["fire", "flying"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
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
