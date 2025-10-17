# Environment Variables Setup

Create a `.env.local` file in the root of your project with these variables:

```bash
# Web3Auth Configuration
# Get your Client ID from: https://dashboard.web3auth.io/
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here

# Zora API Configuration
# Get your API key from: https://zora.co/
NEXT_PUBLIC_ZORA_API_KEY=your_zora_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Important: Web3Auth Dashboard Configuration

After getting your Client ID, you MUST whitelist these URLs in your Web3Auth Dashboard:

### Whitelist URLs (Add to Dashboard)

```
http://localhost:3000
https://your-production-domain.com
https://wallet.base.org
https://wallet.coinbase.com
https://warpcast.com
https://client.warpcast.com
```

### Redirect URIs (Add to Dashboard)

```
http://localhost:3000/*
https://your-production-domain.com/*
```

## Steps:

1. **Create `.env.local`** in project root (this file is gitignored)
2. **Copy the template above** and fill in your actual values
3. **Go to Web3Auth Dashboard** → Your Project → Settings
4. **Add all whitelist URLs** mentioned above
5. **Add redirect URIs** mentioned above
6. **Save and wait 2-3 minutes** for changes to propagate
7. **Restart your dev server**: `npm run dev`

## Troubleshooting

- **"Invalid Client ID"**: Double-check the client ID is correct
- **"Unauthorized domain"**: URL not whitelisted in dashboard
- **Still not working**: Clear browser cache and try again
