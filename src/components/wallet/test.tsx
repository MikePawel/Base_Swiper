import { CardData } from "~/data/dummyCards";
import type { Address } from "viem";

export type ListType =
  | "NEW"
  | "MOST_VALUABLE"
  | "TOP_GAINERS"
  | "FEATURED"
  | "TOP_VOLUME";

/**
 * Truncate text to a maximum length and add ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default: 100 for cards, 200 for modal)
 */
function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

interface ZoraToken {
  node: {
    name?: string;
    symbol?: string;
    description?: string;
    address?: string;
    totalSupply?: string;
    marketCap?: string;
    volume24h?: string;
    uniqueHolders?: number;
    creatorAddress?: string;
    createdAt?: string;
    chainId?: number;
    creatorProfile?: {
      handle?: string;
    };
    mediaContent?: {
      previewImage?: {
        medium?: string;
        small?: string;
      };
      originalUri?: string;
    };
  };
}

interface ZoraApiResponse {
  exploreList?: {
    edges?: ZoraToken[];
  };
}

interface CoinDetailsResponse {
  zora20Token?: {
    name?: string;
    symbol?: string;
    description?: string;
    address?: string;
    totalSupply?: string;
    marketCap?: string;
    volume24h?: string;
    uniqueHolders?: number;
    creatorAddress?: string;
    createdAt?: string;
    chainId?: number;
    creatorProfile?: {
      handle?: string;
    };
    mediaContent?: {
      previewImage?: {
        medium?: string;
        small?: string;
      };
      originalUri?: string;
    };
  };
}

export async function fetchZoraExplore(listType: ListType = "NEW") {
  try {
    const response = await fetch(
      `https://api-sdk.zora.engineering/explore?listType=${listType}&count=20`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    const data = await response.json();
    console.log("Zora API Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching Zora explore:", error);
  }
}

/**
 * Fetch detailed information about a specific coin using the getCoin API
 * This will return comprehensive data including market stats, creator info, and more
 * @param address - The coin contract address
 * @param chain - The chain ID (defaults to Base: 8453)
 */
export async function fetchCoinDetails(address: Address, chain: number = 8453) {
  try {
    const response = await fetch(
      `https://api-sdk.zora.engineering/coin?address=${address}&chain=${chain}`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    const data = await response.json();
    console.log("Coin Details Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching coin details:", error);
    throw error;
  }
}

/**
 * Transform a single coin detail response into CardData format
 * This can be used to update a card with fresh data after fetching
 */
export function transformCoinDetailsToCard(
  coinData: CoinDetailsResponse,
  id: number = 1
): CardData {
  const coin = coinData?.zora20Token;

  if (!coin) {
    throw new Error("Invalid coin data");
  }

  // Get image URL from mediaContent
  const imageUrl =
    coin.mediaContent?.previewImage?.medium ||
    coin.mediaContent?.previewImage?.small ||
    coin.mediaContent?.originalUri ||
    "https://via.placeholder.com/800x1000?text=No+Image";

  // Build description
  const creatorHandle = coin.creatorProfile?.handle || "Unknown Creator";
  const fullDescription = coin.description || `Created by ${creatorHandle}`;

  // Truncate description to 150 characters for better display
  const description = truncateText(fullDescription, 150);

  // Format market cap
  const formatNumber = (num?: string) => {
    if (!num) return "N/A";
    const value = parseFloat(num);
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return {
    id,
    name: coin.name || "Unnamed Token",
    description,
    imageUrl,
    price: formatNumber(coin.marketCap),
    category: coin.creatorProfile?.handle || "Token",
    coinData: {
      address: coin.address,
      symbol: coin.symbol,
      totalSupply: coin.totalSupply,
      marketCap: coin.marketCap,
      volume24h: coin.volume24h,
      uniqueHolders: coin.uniqueHolders,
      creatorAddress: coin.creatorAddress,
      createdAt: coin.createdAt,
      chainId: coin.chainId || 8453,
    },
  };
}

export function transformZoraToCards(zoraData: ZoraApiResponse): CardData[] {
  if (!zoraData?.exploreList?.edges) {
    return [];
  }

  return zoraData.exploreList.edges.map((edge: ZoraToken, index: number) => {
    const token = edge.node;

    // Get image URL from mediaContent
    const imageUrl =
      token.mediaContent?.previewImage?.medium ||
      token.mediaContent?.previewImage?.small ||
      token.mediaContent?.originalUri ||
      "https://via.placeholder.com/800x1000?text=No+Image";

    // Build description with creator and token info
    const creatorHandle = token.creatorProfile?.handle || "Unknown Creator";
    const tokenAddress =
      token.address?.slice(0, 6) + "..." + token.address?.slice(-4);

    const fullDescription =
      token.description ||
      `Created by ${creatorHandle} • Token: ${tokenAddress}`;

    // Truncate description to 120 characters for card display
    const description = truncateText(fullDescription, 120);

    // Format market cap and volume for display
    const formatNumber = (num?: string) => {
      if (!num) return "N/A";
      const value = parseFloat(num);
      if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
      return `$${value.toFixed(2)}`;
    };

    return {
      id: index + 1,
      name: token.name || "Unnamed Token",
      description,
      imageUrl,
      price: formatNumber(token.marketCap),
      category: token.creatorProfile?.handle || "Token",
      coinData: token.address
        ? {
            address: token.address,
            symbol: token.symbol,
            totalSupply: token.totalSupply,
            marketCap: token.marketCap,
            volume24h: token.volume24h,
            uniqueHolders: token.uniqueHolders,
            creatorAddress: token.creatorAddress,
            createdAt: token.createdAt,
            chainId: token.chainId || 8453, // Default to Base
          }
        : undefined,
    };
  });
}
