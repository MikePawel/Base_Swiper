# Coin Query Usage Guide

This guide demonstrates how to use the coin query features with comprehensive data display and Tinder-style modal popups.

## Features

✅ **Display all necessary coin data** - Market cap, volume, supply, holders, etc.  
✅ **Tinder-style modal popup** - Click on any card image to see detailed information  
✅ **Beautiful UI** - Gradient cards, smooth animations, and modern design  
✅ **Copy addresses** - Quick copy functionality for contract and creator addresses  
✅ **Comprehensive data** - All relevant coin information displayed nicely

## Quick Start

### 1. Basic Usage with Explore API

```typescript
import {
  fetchZoraExplore,
  transformZoraToCards,
} from "~/components/wallet/test";
import SwipeCards from "~/components/SwipeCards";

export default function MyComponent() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    async function loadCoins() {
      // Fetch coins from Zora explore API
      const data = await fetchZoraExplore("NEW"); // or "MOST_VALUABLE", "TOP_GAINERS"

      // Transform to card format with all coin data
      const transformedCards = transformZoraToCards(data);
      setCards(transformedCards);
    }

    loadCoins();
  }, []);

  return <SwipeCards cards={cards} />;
}
```

### 2. Fetching Detailed Coin Data

When you need comprehensive data for a specific coin:

```typescript
import {
  fetchCoinDetails,
  transformCoinDetailsToCard,
} from "~/components/wallet/test";

// Fetch detailed information for a specific coin
async function loadCoinDetails() {
  const address = "0x445e9c0a296068dc4257767b5ed354b77cf513de";
  const chain = 8453; // Base chain

  try {
    const coinData = await fetchCoinDetails(address, chain);

    // Access all the detailed information
    const coin = coinData.zora20Token;
    console.log("Name:", coin.name);
    console.log("Symbol:", coin.symbol);
    console.log("Description:", coin.description);
    console.log("Market Cap:", coin.marketCap);
    console.log("24h Volume:", coin.volume24h);
    console.log("Total Supply:", coin.totalSupply);
    console.log("Unique Holders:", coin.uniqueHolders);
    console.log("Creator:", coin.creatorAddress);
    console.log("Created At:", coin.createdAt);

    // Transform to card format if needed
    const card = transformCoinDetailsToCard(coinData);

    return card;
  } catch (error) {
    console.error("Failed to fetch coin details:", error);
  }
}
```

### 3. Modal Popup Interaction

The modal automatically opens when users click on a card image. It displays:

#### **Image Section** (Top)

- Full-size coin image
- Category badge
- Close button

#### **Content Section** (Scrollable)

- **Header**: Coin name and symbol
- **Market Stats Grid** (Color-coded cards):
  - 💙 **Market Cap** - Total market value
  - 💚 **24h Volume** - Trading volume in last 24 hours
  - 💜 **Total Supply** - Total number of tokens
  - 🧡 **Holders** - Number of unique holders

#### **Token Details**:

- Contract address (with copy button)
- Creator address (with copy button)
- Chain information (Base/other)
- Creation date

#### **Action Buttons**:

- "View on Explorer" - Opens blockchain explorer
- "Trade Now" - Opens trading interface

## Data Structure

### CardData Interface

```typescript
interface CardData {
  id: number;
  name: string; // Coin name
  description: string; // Coin description
  imageUrl: string; // Preview image URL
  price: string; // Formatted market cap
  category: string; // Creator handle or "Token"

  // Extended coin data for modal
  coinData?: {
    address: string; // Contract address
    symbol?: string; // Token symbol (e.g., "ETH")
    totalSupply?: string; // Total token supply
    marketCap?: string; // Market capitalization
    volume24h?: string; // 24-hour trading volume
    uniqueHolders?: number; // Number of unique holders
    creatorAddress?: string; // Creator's wallet address
    createdAt?: string; // Creation timestamp
    chainId?: number; // Blockchain ID (8453 = Base)
  };
}
```

## Available API Functions

### `fetchZoraExplore(listType)`

Fetches a list of coins from the Zora explore API.

**Parameters:**

- `listType`: "NEW" | "MOST_VALUABLE" | "TOP_GAINERS"

**Returns:** Raw Zora API response

### `transformZoraToCards(zoraData)`

Transforms Zora API response into CardData format.

**Parameters:**

- `zoraData`: Response from fetchZoraExplore

**Returns:** Array of CardData objects with all coin information

### `fetchCoinDetails(address, chain)`

Fetches comprehensive details for a specific coin.

**Parameters:**

- `address`: Coin contract address (Address type)
- `chain`: Chain ID (default: 8453 for Base)

**Returns:** Detailed coin data including all market stats

### `transformCoinDetailsToCard(coinData, id)`

Transforms detailed coin response into CardData format.

**Parameters:**

- `coinData`: Response from fetchCoinDetails
- `id`: Card ID number (optional)

**Returns:** CardData object with comprehensive information

## Styling & Customization

The modal uses Tailwind CSS with:

- Gradient backgrounds for stat cards
- Smooth animations and transitions
- Responsive design (mobile & desktop)
- Dark overlay backdrop
- Rounded corners and shadows

### Color Coding:

- 💙 **Blue** - Financial data (Market Cap)
- 💚 **Green** - Activity data (Volume)
- 💜 **Purple** - Supply data (Total Supply)
- 🧡 **Orange** - Community data (Holders)
- ⚫ **Gray** - Technical details (Addresses, Chain)

## Example: Complete Implementation

```typescript
"use client";

import { useState, useEffect } from "react";
import SwipeCards from "~/components/SwipeCards";
import {
  fetchZoraExplore,
  transformZoraToCards,
  fetchCoinDetails,
  type ListType,
} from "~/components/wallet/test";
import type { CardData } from "~/data/dummyCards";

export default function CoinExplorer() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [listType, setListType] = useState<ListType>("NEW");

  useEffect(() => {
    loadCoins();
  }, [listType]);

  async function loadCoins() {
    setLoading(true);
    try {
      const data = await fetchZoraExplore(listType);
      const transformedCards = transformZoraToCards(data);
      setCards(transformedCards);
    } catch (error) {
      console.error("Failed to load coins:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshCoin(card: CardData) {
    if (!card.coinData?.address) return;

    try {
      // Fetch fresh data for this specific coin
      const details = await fetchCoinDetails(
        card.coinData.address as any,
        card.coinData.chainId
      );

      console.log("Refreshed coin data:", details);
      // You could update the card in state here
    } catch (error) {
      console.error("Failed to refresh coin:", error);
    }
  }

  const handleBuy = (card: CardData) => {
    console.log("Buy:", card.name);
    handleRefreshCoin(card); // Optionally refresh data
  };

  const handlePass = (card: CardData) => {
    console.log("Pass:", card.name);
  };

  if (loading) {
    return <div>Loading coins...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 justify-center">
        <button
          onClick={() => setListType("NEW")}
          className={`px-4 py-2 rounded-full ${
            listType === "NEW"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          New
        </button>
        <button
          onClick={() => setListType("MOST_VALUABLE")}
          className={`px-4 py-2 rounded-full ${
            listType === "MOST_VALUABLE"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          Most Valuable
        </button>
        <button
          onClick={() => setListType("TOP_GAINERS")}
          className={`px-4 py-2 rounded-full ${
            listType === "TOP_GAINERS"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          Top Gainers
        </button>
      </div>

      {/* Swipe Cards with Modal */}
      <SwipeCards cards={cards} onBuy={handleBuy} onPass={handlePass} />
    </div>
  );
}
```

## Key Features

### 1. **Automatic Data Display**

All relevant coin data is automatically extracted and displayed in the modal when clicking on a card.

### 2. **Smart Number Formatting**

- Large numbers are automatically formatted (K, M, B)
- Addresses are shortened with ellipsis
- Dates are formatted in a readable way

### 3. **Interactive Elements**

- Click card image → Open detailed modal
- Click copy button → Copy address to clipboard
- Click outside modal → Close modal
- Press ESC key → Close modal

### 4. **Responsive Design**

- Mobile: Full-screen bottom sheet style
- Desktop: Centered modal with max-width
- Scrollable content for long data

## Best Practices

1. **Always check for coinData presence** before accessing detailed fields
2. **Handle loading states** when fetching data
3. **Implement error handling** for API calls
4. **Use type safety** with TypeScript interfaces
5. **Test with different chain IDs** if supporting multiple chains

## Troubleshooting

### Modal not showing?

- Ensure `isOpen` state is being set to `true`
- Check that `selectedCard` has data
- Verify the modal component is rendered

### Missing data in modal?

- Check if `coinData` exists on the card object
- Verify API response structure matches expected format
- Look for API errors in console

### Copy function not working?

- Ensure HTTPS context (clipboard API requires secure context)
- Check browser permissions
- Fallback to manual copy if needed

## Additional Resources

- [Zora Coins SDK Documentation](https://docs.zora.co/coins-sdk)
- [Base Chain Documentation](https://docs.base.org)
- [Viem Documentation](https://viem.sh) (for Address types)
