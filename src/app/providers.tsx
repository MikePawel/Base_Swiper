"use client";

import Provider from "../components/providers/WagmiProvider";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { ReactNode } from "react";
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "../lib/web3authConfig";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <Provider>
        <MiniKitProvider
          enabled={true}
          notificationProxyUrl="/api/notify"
          autoConnect={true}
        >
          {children}
        </MiniKitProvider>
      </Provider>
    </Web3AuthProvider>
  );
}
