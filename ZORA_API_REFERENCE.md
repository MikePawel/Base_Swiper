# Zora API Reference - Actual Response Structure

Based on the live Zora API at `https://api-sdk.zora.engineering/explore`

## Available List Types

- `NEW` - Newly created coins
- `MOST_VALUABLE` - Highest market cap coins
- `TOP_GAINERS` - Biggest gainers
- `FEATURED` - Featured/curated coins

## Actual API Response Structure

```typescript
{
  "exploreList": {
    "edges": [
      {
        "node": {
          "__typename": "GraphQLZora20V4Token",
          "name": "Nokia ",
          "symbol": "Nokia ",
          "description": "",
          "address": "0xb45cdfb3795e57f4920fc4e7a7b8e9d24fc50552",

          // Market Data
          "totalSupply": "1000000000",
          "totalVolume": "1.056536",
          "volume24h": "1.06",
          "marketCap": "82.28",              // ✅ String in USD
          "marketCapDelta24h": "82.28",

          // Token Price
          "tokenPrice": {
            "priceInUsdc": "0.000000082411182812211266468313423033505915748",
            "currencyAddress": "0xb45cdfb3795e57f4920fc4e7a7b8e9d24fc50552",
            "priceInPoolToken": "0.003089121769047999989388220143382568494416773319244384765625"
          },

          // Creator Info
          "createdAt": "2025-10-15T11:53:07",
          "creatorAddress": "0x08afb1cebc29b3f692202148da95bb764c79f847",
          "creatorProfile": {
            "handle": "vilton_visuals",
            "avatar": {
              "previewImage": {
                "medium": "https://...",
                "small": "https://..."
              }
            },
            "socialAccounts": {
              "twitter": {
                "username": "vilton_visuals",
                "displayName": "Vilton Visuals"
              }
            },
            "creatorCoin": {
              "address": "0x0b9b14473e652366b016981f3debee2de02efe30"
            }
          },

          // Media
          "mediaContent": {
            "mimeType": "image/jpeg",
            "originalUri": "ipfs://...",
            "previewImage": {
              "small": "https://...",
              "medium": "https://...",
              "blurhash": "eNHLk_9GD%M{M{0L%MxZxtxuE0D%%2R*xuIT%MRjRiRj_2NGIUoJoM"
            }
          },

          // Holders
          "uniqueHolders": 2,                // ✅ Number

          // Blockchain
          "chainId": 8453,                   // Base chain
          "tokenUri": "ipfs://...",

          // Pool Info
          "poolCurrencyToken": {
            "address": "0x...",
            "name": "vilton_visuals",
            "decimals": 18
          }
        },
        "cursor": "eyJhY3Rpdml0eV90..."
      }
    ],
    "pageInfo": {
      "endCursor": "eyJhY3Rpdml0eV90...",
      "hasNextPage": true
    }
  }
}
```

## Key Fields Used in Our App

### Main Card Display:

- ✅ `name` - Coin name
- ✅ `symbol` - Coin symbol
- ✅ `marketCap` - Market cap (string in USD)
- ✅ `volume24h` - 24h trading volume (string)
- ✅ `uniqueHolders` - Number of unique holders (number)
- ✅ `mediaContent.previewImage.medium` - Card image
- ✅ `creatorProfile.handle` - Creator username

### Detailed Modal:

- ✅ `description` - Coin description
- ✅ `totalSupply` - Total token supply (string)
- ✅ `creatorAddress` - Creator wallet address
- ✅ `createdAt` - Creation timestamp
- ✅ `chainId` - Blockchain ID (8453 = Base)
- ✅ `address` - Contract address
- ✅ `tokenPrice.priceInUsdc` - Precise price in USDC

## Data Types

**Important**: Most numeric values come as strings from the API!

```typescript
{
  marketCap: "82.28"; // String, not number!
  volume24h: "1.06"; // String, not number!
  totalSupply: "1000000000"; // String, not number!
  uniqueHolders: 2; // Number ✅
  chainId: 8453; // Number ✅
}
```

## Example Usage

```typescript
import {
  fetchZoraExplore,
  transformZoraToCards,
} from "~/components/wallet/test";

// Fetch featured coins
const data = await fetchZoraExplore("FEATURED");
const cards = transformZoraToCards(data);

// Each card now has:
cards[0].coinData = {
  address: "0xb45cdfb3795e57f4920fc4e7a7b8e9d24fc50552",
  symbol: "Nokia",
  totalSupply: "1000000000",
  marketCap: "82.28", // Already a string
  volume24h: "1.06", // Already a string
  uniqueHolders: 2, // Number
  creatorAddress: "0x08afb1cebc29b3f692202148da95bb764c79f847",
  createdAt: "2025-10-15T11:53:07",
  chainId: 8453,
};
```

## Testing the API

You can test directly in your browser:

- https://api-sdk.zora.engineering/explore?listType=NEW
- https://api-sdk.zora.engineering/explore?listType=FEATURED
- https://api-sdk.zora.engineering/explore?listType=MOST_VALUABLE
- https://api-sdk.zora.engineering/explore?listType=TOP_GAINERS

## Pagination

The API supports pagination using cursors:

```typescript
const response = await fetch(
  `https://api-sdk.zora.engineering/explore?listType=NEW&count=20&after=${cursor}`
);
```

Use `pageInfo.endCursor` as the next `after` parameter.
Use `pageInfo.hasNextPage` to check if there are more results.
