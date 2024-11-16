import type { Metadata } from "next";
import "./globals.css";
import PacmanBackground from "./components/PacmanBackground";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import Footer from "./components/Footer";
import Inter from "./fonts/Inter";

export const metadata: Metadata = {
  title: "Coinvert: Auto-Swap Your Crypto, Your Way!",
  description:
    "Coinvert is an innovative crypto application that automates token swaps. Whenever tokens are received in your wallet, Coinvert instantly converts them into your desired tokens based on predefined preferences, making portfolio management seamless and efficient.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${Inter.className} antialiased bg-black relative w-full`}
      >
        <DynamicContextProvider
          settings={{
            environmentId: "0f83bd3a-7074-49ed-bc7f-fe2a4a1d1aab",
            walletConnectors: [EthereumWalletConnectors],
          }}
        >
          <div className="px-4">{children}</div>
        </DynamicContextProvider>

        <PacmanBackground />
        <Footer />
      </body>
    </html>
  );
}
