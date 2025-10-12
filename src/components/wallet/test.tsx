import { CardData } from "~/data/dummyCards";

export async function fetchZoraExplore() {
  try {
    const response = await fetch(
      "https://api-sdk.zora.engineering/explore?listType=NEW&count=20",
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

export function transformZoraToCards(zoraData: any): CardData[] {
  if (!zoraData?.exploreList?.edges) {
    return [];
  }

  return zoraData.exploreList.edges.map((edge: any, index: number) => {
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

    // Get price information
    let price = "Free";
    if (token.tokenPrice?.priceInUsdc) {
      price = `$${token.tokenPrice.priceInUsdc}`;
    } else if (token.marketCap && token.marketCap !== "0") {
      price = `Market Cap: $${parseFloat(token.marketCap).toFixed(2)}`;
    }

    return {
      id: index + 1,
      name: token.name || "Unnamed Token",
      description,
      imageUrl,
      price,
      category: token.creatorProfile?.handle || "Token",
    };
  });
}
