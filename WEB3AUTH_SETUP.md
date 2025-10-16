# Web3Auth Setup Instructions

## 🔐 Getting Your Web3Auth Client ID

1. **Go to Web3Auth Dashboard**: Visit [https://dashboard.web3auth.io/](https://dashboard.web3auth.io/)

2. **Create an Account**: Sign up or log in to your Web3Auth account

3. **Create a New Project**:

   - Click on "Create Project"
   - Enter your project name (e.g., "Base Swiper")
   - Select "Plug and Play" as the product type

4. **Configure Your Project**:

   - Select **Sapphire Mainnet** for production or **Sapphire Devnet** for testing
   - Add your application URL (e.g., `http://localhost:3000` for development)

5. **Get Your Client ID**: Copy the Client ID from the dashboard

## 📝 Environment Setup

Create a `.env.local` file in the root of your project:

```bash
# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=YOUR_CLIENT_ID_HERE

# Optional: Zora API Key
NEXT_PUBLIC_ZORA_API_KEY=
```

Replace `YOUR_CLIENT_ID_HERE` with the Client ID you copied from the Web3Auth Dashboard.

## 🚀 Running the Application

After setting up your environment variables:

```bash
npm install
npm run dev
```

## 🌐 Network Configuration

The application is configured to use **Base Mainnet**:

- Chain ID: 8453 (0x2105 in hex)
- RPC URL: https://mainnet.base.org
- Block Explorer: https://basescan.org

You can modify the network settings in `src/lib/web3authConfig.ts` if needed.

## 🔗 Useful Links

- [Web3Auth Documentation](https://web3auth.io/docs/)
- [Web3Auth Dashboard](https://dashboard.web3auth.io/)
- [Base Documentation](https://docs.base.org/)
