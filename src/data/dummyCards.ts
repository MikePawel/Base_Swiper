export interface CardData {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  category: string;
  // Extended coin data for detailed view
  coinData?: {
    address: string;
    symbol?: string;
    totalSupply?: string;
    marketCap?: string;
    volume24h?: string;
    uniqueHolders?: number;
    creatorAddress?: string;
    createdAt?: string;
    chainId?: number;
  };
}

export const dummyCards: CardData[] = [
  {
    id: 1,
    name: "NFT Ape Collection",
    description: "Exclusive digital art from the metaverse",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1000&fit=crop",
    price: "0.5 ETH",
    category: "NFT",
  },
  {
    id: 2,
    name: "Crypto Punk #7890",
    description: "Rare collectible from the iconic series",
    imageUrl:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=1000&fit=crop",
    price: "2.3 ETH",
    category: "NFT",
  },
  {
    id: 3,
    name: "Base Builder Token",
    description: "Governance token for Base ecosystem",
    imageUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=1000&fit=crop",
    price: "0.15 ETH",
    category: "Token",
  },
  {
    id: 4,
    name: "Digital Artwork #42",
    description: "Generative art on Base blockchain",
    imageUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=1000&fit=crop",
    price: "0.8 ETH",
    category: "Art",
  },
  {
    id: 5,
    name: "Base Degen Pass",
    description: "Access to exclusive Base community",
    imageUrl:
      "https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=800&h=1000&fit=crop",
    price: "1.0 ETH",
    category: "Membership",
  },
  {
    id: 6,
    name: "Virtual Land Plot",
    description: "Prime real estate in Base metaverse",
    imageUrl:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=1000&fit=crop",
    price: "3.5 ETH",
    category: "Land",
  },
  {
    id: 7,
    name: "Cybernetic Avatar",
    description: "3D character for your digital identity",
    imageUrl:
      "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&h=1000&fit=crop",
    price: "0.6 ETH",
    category: "Avatar",
  },
  {
    id: 8,
    name: "Base Token Rare",
    description: "Limited edition governance token",
    imageUrl:
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&h=1000&fit=crop",
    price: "1.2 ETH",
    category: "Token",
  },
  {
    id: 9,
    name: "Abstract Collection #1",
    description: "Modern digital art masterpiece",
    imageUrl:
      "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&h=1000&fit=crop",
    price: "0.9 ETH",
    category: "Art",
  },
  {
    id: 10,
    name: "Base Gaming Pass",
    description: "Early access to Base gaming ecosystem",
    imageUrl:
      "https://images.unsplash.com/photo-1636955840493-f43a02bfa064?w=800&h=1000&fit=crop",
    price: "0.4 ETH",
    category: "Gaming",
  },
];
