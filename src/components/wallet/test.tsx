import { CardData } from "~/data/dummyCards";

export type ListType = "NEW" | "MOST_VALUABLE" | "TOP_GAINERS";

interface ZoraToken {
  node: {
    name?: string;
    description?: string;
    address?: string;
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

    const description =
      token.description ||
      `Created by ${creatorHandle} • Token: ${tokenAddress}`;

    return {
      id: index + 1,
      name: token.name || "Unnamed Token",
      description,
      imageUrl,
      price: "",
      category: token.creatorProfile?.handle || "Token",
    };
  });
}
