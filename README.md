# 🔥 Base Swiper — Tinder for Zora Tokens

**Swipe Right to Buy, Left to Pass. The Future of Token Discovery on Base.**

[![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=for-the-badge&logo=ethereum)](https://base.org)  
[![Powered by Zora](https://img.shields.io/badge/Powered%20by-Zora-000000?style=for-the-badge)](https://zora.co)

[Live Demo](https://base-swiper.vercel.app) • [Documentation](#documentation) • [Features](#features)

---

## 🎯 The Problem

**Token discovery is broken.**

Users face information overload when exploring new tokens on-chain. Traditional DEX interfaces are cluttered, confusing, and overwhelming - especially for newcomers. We need a better way to discover and trade tokens that's:

- **Intuitive** - Anyone can understand "swipe right to buy"
- **Fast** - Make decisions in seconds, not minutes
- **Mobile-First** - Trading on-the-go shouldn't be painful
- **Safe** - Set spending limits before you start

## 💡 The Solution

**Base Swiper** transforms token discovery into an addictive, Tinder-like experience. Swipe through curated tokens from Zora, see instant stats, and buy with one swipe. It's DeFi meets dating apps - and it actually works.

### Why This Matters

- **80+ tokens** loaded dynamically from Zora's API
- **One-swipe purchases** using Zora Coins SDK
- **Smart spending controls** - Set your USDC limit per token
- **Instant feedback** - Know your transaction status immediately
- **Farcaster Integration** - Native mini app experience

---

## ✨ Features

### 🎴 Tinder-Style Card Interface

- **Swipe Right** → Buy the token instantly
- **Swipe Left** → Pass and move to the next
- **Tap Card** → View detailed token information in a beautiful modal
- Smooth animations with stacked card preview

### 💰 Smart Spending Management

- **Set Custom Amounts** - Define how much USDC to spend per token (0.01 - 1000 USDC)
- **localStorage Persistence** - Your preferences saved across sessions
- **Adjustable Anytime** - Change spending amount from wallet settings
- **Quick Presets** - One-tap amounts: 0.1, 0.5, 1, 5 USDC

### 🔐 Seamless Authentication

- **Login on First Buy** - Only connect wallet when you need to
- **Web3Auth Integration** - Email/social login + self-custodial wallet
- **Card Restoration** - Swiped card returns if login is needed
- **Smart Flow** - Login → Set Amount → Back to Swiping

### 📊 Rich Token Data

Real-time data from Zora's Explore API:

- Market Cap & 24h Volume
- Total Supply & Holder Count
- Creator Information
- Token Contract Details
- High-quality Token Images
- Copy-to-clipboard addresses

### 🚀 Progressive Loading

- **Fast Initial Load** - 20 FEATURED tokens load instantly
- **Background Loading** - Remaining 60 cards load while you swipe
- **Four Categories**: FEATURED → TOP_GAINERS → MOST_VALUABLE → NEW
- **No Interruptions** - Seamless experience as more cards arrive

### 💸 On-Chain Trading

- **Zora Coins SDK** - Direct on-chain token swaps
- **USDC Payments** - Stable, predictable pricing
- **Slippage Protection** - 5% default slippage tolerance
- **Balance Checks** - Prevents failed transactions
- **Gas Validation** - Ensures sufficient ETH for fees

### 🎨 Beautiful UI/UX

- **Clean Modals** - Detailed token info without clutter
- **Toast Notifications** - Subtle 2-second confirmations
- **Haptic Feedback** - Tactile responses on actions
- **Responsive Design** - Perfect on all screen sizes
- **Dark Mode Ready** - Easy on the eyes

### 🔄 Additional Features

- **Buy List** - Track tokens you swiped right on
- **Wallet Management** - View balances and connection status
- **Category Indicators** - Know which API feed you're viewing
- **Empty State** - "Start Over" when you've seen all cards
- **Error Handling** - Graceful failures with helpful messages

---

## 🏗️ Technical Stack

### Frontend

- **Next.js 15.5** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Tinder Card** - Swipe gesture library

### Web3 Integration

- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript-first Ethereum library
- **Web3Auth** - Social login + wallet creation
- **Zora Coins SDK** - Token trading infrastructure
- **OnchainKit** - Coinbase's web3 components

### APIs & Services

- **Zora Explore API** - Token discovery and metadata
- **Base Chain** - L2 for fast, cheap transactions
- **Vercel** - Deployment and hosting
- **Farcaster MiniKit** - Frame and mini app SDK

---

## 🚀 Getting Started

### Prerequisites

```
Node.js 18+
npm or yarn
A Vercel account (for deployment)
Web3Auth API keys (optional for social login)
```

### Installation

1.  **Clone the repository**

```
git clone https://github.com/yourusername/base-swiper.git
cd base-swiper
```

1.  **Install dependencies**

```
npm install
# or
yarn install
```

1.  **Set up environment variables**  
    Create a `.env.local` file:

```
NEXT_PUBLIC_URL=https://your-domain.vercel.app
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
```

1.  **Run the development server**

```
npm run dev
# or
yarn dev
```

1.  **Open in browser**

```
http://localhost:3000
```

### Testing as a Farcaster Mini App

Use [ngrok](https://ngrok.com/) to tunnel your local server:

```
ngrok http 3000
```

Then update `src/lib/utils.ts` with your ngrok URL:

```typescript
export const METADATA = {
  homeUrl: "https://your-ngrok-url.ngrok.app",
  // ... rest of config
};
```

---

## 📱 How to Use

### For Users

**Start Swiping** 🎴

- Open the app and browse through tokens
- Swipe right on tokens you like, left to pass

**Connect Wallet** 🔐

- On first purchase, you'll be prompted to connect
- Use Web3Auth for easy email/social login
- Your wallet is created instantly

**Set Spending Amount** 💰

- Choose how much USDC to spend per token
- Quick presets or custom amount
- Change anytime in wallet settings

**Complete Purchase** ✅

- Swipe right to buy
- Transaction executes on-chain
- Get instant confirmation

### For Developers

Check out these key files:

- `src/components/Demo.tsx` - Main app logic and state management
- `src/components/SwipeCards.tsx` - Tinder card implementation
- `src/components/CoinDetailModal.tsx` - Token detail modal
- `src/components/wallet/test.tsx` - Zora API integration
- `src/lib/swapTokens.ts` - Trading logic with Zora SDK

---

## 🎨 Design Decisions

### Why Tinder-Style?

- **Familiar UX** - Everyone knows how to swipe
- **Fast Decisions** - Reduces analysis paralysis
- **Mobile Native** - Touch gestures feel natural
- **Addictive** - Gamification increases engagement

### Why Web3Auth?

- **Lower Barrier** - Email login vs. complex wallet setup
- **Self-Custodial** - Users still own their keys
- **Better UX** - Social recovery, no seed phrases to save
- **Faster Onboarding** - Get trading in seconds

### Why USDC?

- **Price Stability** - No ETH volatility concerns
- **Clear Budgeting** - Know exactly what you're spending
- **Base Native** - USDC is the standard on Base
- **Better UX** - Familiar dollar amounts

### Why Progressive Loading?

- **Instant Engagement** - Don't wait for 80 cards to load
- **Better Performance** - Smaller initial payload
- **Smooth Experience** - Background loading is invisible
- **API Efficiency** - 4 separate calls load faster

---

## 🔮 Future Enhancements

- **Portfolio View** - Track all purchased tokens
- **Price Alerts** - Get notified on price changes
- **Social Features** - Share favorite tokens
- **Advanced Filters** - Filter by market cap, volume, etc.
- **Custom Feeds** - Create personalized token lists
- **Multi-Chain** - Expand beyond Base
- **Swap History** - View past transactions
- **Referral Program** - Earn rewards for sharing
- **AI Recommendations** - ML-powered token suggestions
- **Limit Orders** - Buy when price hits target

---

## 📊 Project Stats

- **Lines of Code**: 15,000+
- **Components**: 20+
- **API Integrations**: 3 (Zora, Web3Auth, Farcaster)
- **Chains Supported**: 1 (Base)
- **Tokens Available**: 80+ (dynamically loaded)
- **Load Time**: \<2s for first 20 cards
- **Mobile Optimized**: ✅ 100%

---

## 🏆 Why This Project Wins

### Innovation 🚀

- **First Tinder-style token discovery** on Base
- **Novel UX** that makes DeFi accessible to anyone
- **Smart spending controls** that traditional DEXs lack

### Technical Excellence 💻

- **Production-ready code** with TypeScript and proper error handling
- **Optimized performance** with progressive loading and caching
- **Best practices** - Clean architecture, reusable components

### User Experience 🎨

- **Beautiful UI** with smooth animations and transitions
- **Intuitive flows** - No learning curve required
- **Mobile-first** - Works perfectly on all devices

### Business Potential 💼

- **Real trading** - Not just a demo, actual on-chain swaps
- **Scalable** - Architecture supports millions of users
- **Monetizable** - Clear paths to revenue (fees, premium features)

### Community Impact 🌍

- **Lowers barriers** to DeFi participation
- **Educates users** with rich token data
- **Drives volume** to Base ecosystem
- **Open source** - Others can build on our work

---

## 🛠️ Development

### Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── actions/      # Farcaster action components
│   ├── providers/    # Context providers
│   ├── wallet/       # Web3 wallet components
│   └── ui/           # Reusable UI components
├── lib/              # Utility functions
└── data/             # Static data and types
```

### Key Technologies

**State Management**

- React Hooks (useState, useEffect, useCallback)
- localStorage for persistence
- Context API for global state

**Styling**

- Tailwind CSS for utility classes
- Custom animations with CSS-in-JS
- Responsive breakpoints

**Web3**

- Wagmi for wallet connections
- Viem for contract interactions
- Web3Auth for authentication

---

## 📚 Documentation

### API Reference

**Zora Explore API**

```typescript
fetchZoraExplore(listType: ListType): Promise<ZoraApiResponse>
// listType: "FEATURED" | "TOP_GAINERS" | "MOST_VALUABLE" | "NEW"
```

**Trading**

```typescript
tradeCoin({
  tradeParameters: TradeParameters,
  walletClient: WalletClient,
  account: Address,
  publicClient: PublicClient
}): Promise<TransactionReceipt>
```

### Environment Variables

| Variable                         | Description         | Required |
| -------------------------------- | ------------------- | -------- |
| `NEXT_PUBLIC_URL`                | Production URL      | Yes      |
| `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` | Web3Auth project ID | Yes      |

---

## 🤝 Contributing

We welcome contributions! Here's how:

1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit changes (`git commit -m 'Add amazing feature'`)
4.  Push to branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier formatting
- Meaningful commit messages
- Component documentation

---

## 🙏 Acknowledgments

- **Base** - For building an amazing L2
- **Zora** - For the powerful Coins SDK and API
- **Farcaster** - For the mini app framework
- **Web3Auth** - For seamless authentication
- **Coinbase** - For OnchainKit and developer tools

---

**Made with 💙 for the Base Ecosystem**

_Bringing the future of token discovery to everyone_

[⬆ Back to Top](#-base-swiper--tinder-for-zora-tokens)
