"use client";
import { FC } from "react";
import {
  DynamicWidget,
  useDynamicContext,
  useSocialAccounts,
} from "@dynamic-labs/sdk-react-core";
import { ProviderEnum } from "@dynamic-labs/types";
import { FarcasterIcon, GoogleIcon, TwitterIcon } from "@dynamic-labs/iconic";

const SocialSignIn = () => {
  const { error, isProcessing, signInWithSocialAccount } = useSocialAccounts();

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className="flex flex-row justify-center items-center gap-4">
        <button
          className="bg-white p-2 rounded-md shadow-md"
          onClick={() => signInWithSocialAccount(ProviderEnum.Farcaster)}
        >
          <FarcasterIcon className="w-8 h-8" />
        </button>
        <button
          className="bg-white p-2 rounded-md shadow-md"
          onClick={() => signInWithSocialAccount(ProviderEnum.Google)}
        >
          <GoogleIcon className="w-8 h-8" />
        </button>
        <button
          className="bg-white p-2 rounded-md shadow-md"
          onClick={() => signInWithSocialAccount(ProviderEnum.Twitter)}
        >
          <TwitterIcon className="w-8 h-8 text-white" />
        </button>
      </div>
      {isProcessing && <span className="processing">Processing...</span>}
      {error && <span className="error">{error.message}</span>}
    </div>
  );
};

const LoggedInUser = () => {
  const { user } = useDynamicContext();

  return (
    <>
      <DynamicWidget />
      <p>user: {user?.email}</p>
    </>
  );
};

export const HeadlessSocialSignInView: FC = () => {
  const { user } = useDynamicContext();

  return (
    <div style={{ overflowY: "scroll" }}>
      {user ? <LoggedInUser /> : <SocialSignIn />}
    </div>
  );
};
