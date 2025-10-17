/**
 * Detect if the app is running in an embedded browser/webview
 * (e.g., Base wallet, Farcaster, MetaMask mobile browser)
 */
export function isEmbeddedBrowser(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || "";
  const isStandalonePWA = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;

  // Check for common embedded browser indicators
  const embeddedIndicators = [
    /Farcaster/i,
    /Warpcast/i,
    /Frame/i,
    /CoinbaseWallet/i,
    /MetaMaskMobile/i,
    /Trust/i,
    /FB_IAB/i, // Facebook in-app browser
    /FBAN/i, // Facebook app
    /Instagram/i,
    /Line/i,
    /MicroMessenger/i, // WeChat
  ];

  const isEmbedded = embeddedIndicators.some((pattern) =>
    pattern.test(userAgent)
  );

  // Check if we're in an iframe
  const isInIframe = window.self !== window.top;

  return isEmbedded || isInIframe || isStandalonePWA;
}

/**
 * Detect if running in Farcaster specifically
 */
export function isFarcasterFrame(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || "";
  return /Farcaster|Warpcast|Frame/i.test(userAgent) || !!window.parent;
}

/**
 * Detect if running in Base wallet
 */
export function isBaseWallet(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || "";
  return /CoinbaseWallet|Base/i.test(userAgent);
}

/**
 * Check if OAuth popups are likely to work
 */
export function canUsePopups(): boolean {
  if (typeof window === "undefined") return false;

  // Embedded browsers typically block popups
  if (isEmbeddedBrowser()) return false;

  // Try to detect if popups are blocked
  try {
    const popup = window.open("", "_blank", "width=1,height=1");
    if (popup) {
      popup.close();
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
