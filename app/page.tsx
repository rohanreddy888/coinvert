import GradualSpacing from "@/components/ui/gradual-spacing";
import Image from "next/image";
import { HeadlessSocialSignInView } from "./components/Dynamic/Dynamic";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col gap-12 justify-center items-center text-white text-center">
      <div className="flex flex-col justify-center items-center gap-12">
        <Image src="/logo.svg" alt="Logo" width={350} height={350} />

        <GradualSpacing
          className="font-display text-center text-xl font-bold text-white md:text-2xl"
          text="Auto-Swap Your Crypto, Your Way!"
        />
      </div>
      <div className="fancy-box max-w-md w-full bg-transparent rounded-xl">
        <div className="bg-card flex flex-col justify-center items-center gap-4 px-6 py-4 border border-border rounded-xl">
          <h2 className="font-semibold">Log in or sign up</h2>

          <HeadlessSocialSignInView />
        </div>
      </div>
      {/* <p className="text-xl max-w-4xl">
        Coinvert is an innovative crypto application that automates token swaps.
        Whenever tokens are received in your wallet, Coinvert instantly converts
        them into your desired tokens based on predefined preferences, making
        portfolio management seamless and efficient.
      </p> */}
    </div>
  );
}
