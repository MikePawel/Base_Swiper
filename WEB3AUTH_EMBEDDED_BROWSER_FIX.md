# Web3Auth in Embedded Browsers - Complete Fix Guide

## The Problem

Web3Auth authentication (Google, Email, etc.) doesn't work in embedded browsers like:

- **Base Wallet** browser
- **Farcaster/Warpcast** frames
- **MetaMask mobile** browser
- Other in-app browsers

**Why?** Embedded browsers block popups and OAuth redirects for security reasons, which Web3Auth relies on.

---

## Solutions (Choose One or Combine)

### ✅ Solution 1: Whitelist URLs in Web3Auth Dashboard (CRITICAL)

**This is the most important step!**

1. Go to [Web3Auth Dashboard](https://dashboard.web3auth.io/)
2. Select your project
3. Navigate to **"Social Login"** or **"Verifiers"** settings
4. Add these to **"Whitelist URLs"**:

   ```
   https://your-production-domain.com
   http://localhost:3000
   https://wallet.base.org
   https://wallet.coinbase.com
   https://warpcast.com
   https://client.warpcast.com
   ```

5. Add these to **"Redirect URIs"**:

   ```
   https://your-production-domain.com/*
   https://your-production-domain.com/auth/callback
   http://localhost:3000/*
   ```

6. **Save changes** and wait 2-3 minutes for propagation

### ✅ Solution 2: User Warning (Already Implemented)

I've added an automatic warning that detects embedded browsers and guides users to:

- Open the app in their regular browser
- Copy the URL to use externally
- Use the "Open in External Browser" button

Files added:

- `src/lib/detectEnvironment.ts` - Detects embedded browsers
- `src/components/EmbeddedBrowserWarning.tsx` - Shows warning UI
- Updated `src/components/wallet/WalletActions.tsx` - Includes warning

### ✅ Solution 3: Use Farcaster Authentication Directly

Since you're already in Farcaster context, you could use Farcaster's native auth:

```typescript
import { useAccount } from "wagmi";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

// Users would connect using Farcaster connector
// This automatically uses their Farcaster wallet
const { connect } = useConnect();

// Connect with Farcaster
connect({ connector: farcasterMiniApp() });
```

**Pros:**

- Works perfectly in Farcaster
- No popup/redirect issues
- Seamless user experience

**Cons:**

- Only works in Farcaster (not Base wallet)
- Need separate auth flow for other contexts

### ✅ Solution 4: Install OpenLogin Adapter (Advanced)

For more control over the authentication flow:

```bash
npm install @web3auth/openlogin-adapter
```

Then update `src/lib/web3authConfig.ts`:

```typescript
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    uxMode: "redirect", // Use redirect instead of popup
    loginConfig: {
      google: {
        name: "Google",
        verifier: "google",
        typeOfLogin: "google",
        clientId: "", // Optional: your own Google OAuth client
      },
    },
  },
});

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
  adapters: [openloginAdapter],
};
```

---

## Testing Checklist

After making changes, test in:

- [ ] Regular Chrome/Safari browser ✅ (should work)
- [ ] Base Wallet browser 🔧 (main concern)
- [ ] Farcaster frame 🔧 (main concern)
- [ ] Mobile browsers 📱
- [ ] Incognito mode 🕵️

---

## Quick Debugging

If authentication still fails:

### 1. Check Browser Console

Look for errors like:

- `Popup blocked`
- `Cross-origin request blocked`
- `Redirect URI mismatch`

### 2. Verify Web3Auth Config

```bash
# Check if your client ID is set
echo $NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
```

### 3. Test Outside Embedded Browser

Open your app directly in Chrome/Safari to verify Web3Auth works there first.

### 4. Check Network Requests

- Open DevTools → Network tab
- Look for calls to `auth.web3auth.io`
- Check for 4xx errors (usually means whitelist issues)

---

## Alternative: Remove Web3Auth Dependency

If you're only deploying to Farcaster/Base wallet, consider:

**Option A: Use Wagmi + Farcaster connector only**

```typescript
// Users already have wallets in Base wallet/Farcaster
// Just use those directly via Wagmi
```

**Option B: Use Coinbase Smart Wallet**

```typescript
import { coinbaseWallet } from "wagmi/connectors";
// Better integration with Base ecosystem
```

---

## Need More Help?

### Web3Auth Support

- [Web3Auth Docs - Embedded Browsers](https://web3auth.io/docs/troubleshooting/different-web-browsers)
- [Web3Auth Discord](https://discord.gg/web3auth)

### Check These Settings

1. Is your domain added to Web3Auth dashboard?
2. Are you using the correct Client ID?
3. Is your Web3Auth network set correctly (mainnet vs testnet)?
4. Have you waited 2-3 minutes after changing dashboard settings?

---

## What I've Implemented

✅ Warning system for embedded browsers
✅ Auto-detection of Base wallet and Farcaster
✅ "Open in external browser" functionality  
✅ URL copy feature for manual opening
✅ Graceful fallback handling

**You still need to:**

1. Whitelist URLs in Web3Auth dashboard (CRITICAL)
2. Test in Base wallet and Farcaster
3. Consider using Farcaster auth directly (optional but recommended)
