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
    <div className="headless-social-signin">
      <div className="headless-social-signin__container">
        <p>Log in or sign up</p>

        <button onClick={() => signInWithSocialAccount(ProviderEnum.Farcaster)}>
          <FarcasterIcon />
          Sign in with Farcaster
        </button>
        <button onClick={() => signInWithSocialAccount(ProviderEnum.Google)}>
          <GoogleIcon />
          Sign in with Google
        </button>
        <button onClick={() => signInWithSocialAccount(ProviderEnum.Twitter)}>
          <TwitterIcon />
          Sign in with Twitter
        </button>
        {isProcessing && <span className="processing">Processing...</span>}
        {error && <span className="error">{error.message}</span>}
      </div>
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
