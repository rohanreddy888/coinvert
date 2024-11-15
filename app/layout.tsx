import type { Metadata } from "next";
import { Roboto as Inter } from "next/font/google";
import "./globals.css";
import PacmanBackground from "./components/PacmanBackground";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["100", "300", "400", "500", "700", "900"],
});

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
        className={`${inter.variable} antialiased bg-black relative w-full`}
      >
        <DynamicContextProvider
          settings={{
            environmentId: "0f83bd3a-7074-49ed-bc7f-fe2a4a1d1aab",
            walletConnectors: [EthereumWalletConnectors],
          }}
        >
          {children}
        </DynamicContextProvider>

        <PacmanBackground />
      </body>
    </html>
  );
}
