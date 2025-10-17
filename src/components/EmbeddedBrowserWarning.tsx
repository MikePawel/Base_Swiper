"use client";

import React, { useEffect, useState } from "react";
import {
  isEmbeddedBrowser,
  isFarcasterFrame,
  isBaseWallet,
} from "~/lib/detectEnvironment";

interface EmbeddedBrowserWarningProps {
  onOpenExternal?: () => void;
}

export default function EmbeddedBrowserWarning({
  onOpenExternal,
}: EmbeddedBrowserWarningProps) {
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [browserType, setBrowserType] = useState<string>("");

  useEffect(() => {
    const embedded = isEmbeddedBrowser();
    setIsEmbedded(embedded);

    if (embedded) {
      if (isFarcasterFrame()) {
        setBrowserType("Farcaster");
      } else if (isBaseWallet()) {
        setBrowserType("Base Wallet");
      } else {
        setBrowserType("an embedded browser");
      }
    }
  }, []);

  if (!isEmbedded) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-1">
            Limited Authentication Support
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            You&apos;re using this app in {browserType}. Social login (Google,
            Email, etc.) may not work due to browser restrictions.
          </p>

          <div className="space-y-2">
            <p className="text-xs text-yellow-700 font-medium">
              Recommended solutions:
            </p>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
              <li>
                Open this app in your regular browser (Chrome, Safari, etc.)
              </li>
              <li>Or connect using the Farcaster connector if available</li>
            </ul>
          </div>

          {onOpenExternal && (
            <button
              onClick={onOpenExternal}
              className="mt-3 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              Open in External Browser
            </button>
          )}

          {currentUrl && (
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-xs text-yellow-700 mb-1">Or copy this URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-yellow-100 text-yellow-900 px-2 py-1 rounded break-all">
                  {currentUrl}
                </code>
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(currentUrl);
                      alert("URL copied to clipboard!");
                    }
                  }}
                  className="text-xs text-yellow-700 hover:text-yellow-900 underline"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
