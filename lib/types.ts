export interface TierItem {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface TierRow {
  id: string;
  label: string;
  colorClass: string;
  color: string;
  items: TierItem[];
}

export const DEFAULT_TIERS: Omit<TierRow, 'items'>[] = [
  { id: 's', label: 'S', colorClass: 'tier-s', color: '#ff7f7f' },
  { id: 'a', label: 'A', colorClass: 'tier-a', color: '#ffbf7f' },
  { id: 'b', label: 'B', colorClass: 'tier-b', color: '#ffdf7f' },
  { id: 'c', label: 'C', colorClass: 'tier-c', color: '#ffff7f' },
  { id: 'd', label: 'D', colorClass: 'tier-d', color: '#bfff7f' },
  { id: 'f', label: 'F', colorClass: 'tier-f', color: '#7fbfff' },
];

export interface Template {
  id: string;
  nameKey: string;
  items: string[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'pokemon-gen1',
    nameKey: 'templatePokemon',
    items: ['Pikachu', 'Charizard', 'Mewtwo', 'Blastoise', 'Venusaur', 'Gengar', 'Dragonite', 'Snorlax', 'Alakazam', 'Gyarados', 'Arcanine', 'Machamp', 'Lapras', 'Eevee', 'Jigglypuff', 'Magikarp'],
  },
  {
    id: 'lol-roles',
    nameKey: 'templateLoL',
    items: ['Ahri', 'Yasuo', 'Lux', 'Jinx', 'Thresh', 'Lee Sin', 'Zed', 'Teemo', 'Vayne', 'Darius', 'Katarina', 'Ezreal', 'Garen', 'Morgana', 'Blitzcrank', 'Jhin'],
  },
  {
    id: 'anime',
    nameKey: 'templateAnime',
    items: ['Naruto', 'One Piece', 'Attack on Titan', 'Dragon Ball Z', 'Death Note', 'Demon Slayer', 'Jujutsu Kaisen', 'My Hero Academia', 'Fullmetal Alchemist', 'Hunter x Hunter', 'Spy x Family', 'Chainsaw Man'],
  },
  {
    id: 'movies-2020s',
    nameKey: 'templateMovies',
    items: ['Oppenheimer', 'Everything Everywhere', 'Dune', 'Spider-Verse', 'Top Gun: Maverick', 'The Batman', 'Barbie', 'John Wick 4', 'Parasite', 'Tenet', 'No Time to Die', 'The Menu'],
  },
  {
    id: 'fast-food',
    nameKey: 'templateFood',
    items: ["McDonald's", 'Chick-fil-A', 'Wendy\'s', 'Taco Bell', 'Burger King', 'KFC', 'Subway', 'Popeyes', 'Five Guys', 'In-N-Out', 'Chipotle', 'Panda Express'],
  },
];
