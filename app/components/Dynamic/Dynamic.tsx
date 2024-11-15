"use client";
import { FC, useEffect } from "react";
import {
  useDynamicContext,
  useSocialAccounts,
} from "@dynamic-labs/sdk-react-core";
import { ProviderEnum } from "@dynamic-labs/types";
import { DiscordIcon, FarcasterIcon, GoogleIcon } from "@dynamic-labs/iconic";
import { Separator } from "@/components/ui/separator";
import { ConnectWithEmailView } from "./ConnectEmail";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SocialSignIn = () => {
  const { error, signInWithSocialAccount } = useSocialAccounts();

  return (
    <div className="flex flex-col justify-center items-center gap-8 w-full">
      <ConnectWithEmailView />
      <div className="relative w-full">
        <Separator />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-4 py-2 rounded-full text-sm">
          OR
        </div>
      </div>
      <div className="flex flex-row justify-center items-center gap-4">
        <button
          className="bg-input p-2 rounded-md shadow-md"
          onClick={() => signInWithSocialAccount(ProviderEnum.Farcaster)}
        >
          <FarcasterIcon className="w-8 h-8" />
        </button>
        <button
          className="bg-input p-2 rounded-md shadow-md"
          onClick={() => signInWithSocialAccount(ProviderEnum.Google)}
        >
          <GoogleIcon className="w-8 h-8" />
        </button>
        <button
          className="bg-input p-2 rounded-md shadow-md"
          onClick={() => signInWithSocialAccount(ProviderEnum.Discord)}
        >
          <DiscordIcon className="w-8 h-8 text-white" />
        </button>
      </div>
      {error && <span className="error">{error.message}</span>}
    </div>
  );
};

const LoggedInUser = () => {
  const { user } = useDynamicContext();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [router, user]);
  return (
    <div className="flex justify-center items-center w-full">
      <Image src="/pacman.gif" alt="Logo" width={50} height={50} />
    </div>
  );
};

export const DynamicSocialLogin: FC = () => {
  const { user } = useDynamicContext();

  return (
    <div className="fancy-box max-w-md w-full bg-transparent rounded-xl">
      <div className="bg-card flex flex-col justify-center items-center gap-4 px-6 py-5 border-2 border-border rounded-xl w-full">
        <h2 className="font-semibold text-lg mb-2">Log in or sign up</h2>

        <div className="w-full mt-4">
          {user ? <LoggedInUser /> : <SocialSignIn />}
        </div>
        <div className="text-border text-xs flex flex-row justify-center items-center gap-2 w-full mt-2">
          Powered by{" "}
          <svg
            fill="none"
            viewBox="0 0 114 21"
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5"
          >
            <g clipPath="url(#a)">
              <path
                d="m10.053 2.0025c-0.42916 0.39997-0.85094 0.79254-1.2727 1.1832-1.959 1.8184-3.9181 3.6387-5.879 5.4534-0.44952 0.41664-0.9157 0.81661-1.4799 1.061-0.67151 0.29072-1.0563 0.10925-1.2727-0.61478-0.30153-1.0129-0.14059-1.9573 0.44212-2.8276 0.49578-0.7407 1.121-1.3573 1.7629-1.9573 1.023-0.9555 2.0534-1.9017 3.0967-2.8313 0.45693-0.40738 0.9564-0.77957 1.5669-0.90364 1.8277-0.3685 2.9932 1.3832 3.0376 1.4351l-0.0019 0.00186z"
                fill="currentColor"
              ></path>
              <path
                d="m1.2588 11.254c1.1118-0.3204 1.9461-1.0259 2.7582-1.7684 2.5898-2.3628 5.176-4.7275 7.7769-7.0773 0.5735-0.51848 1.1766-1.0148 1.8148-1.4481 0.8121-0.55182 1.6945-0.63144 2.5639-0.10555 0.3145 0.18888 0.6234 0.40923 0.8787 0.67218 0.8861 0.91661 1.7611 1.848 2.6139 2.7961 0.9065 1.0073 1.7981 2.0295 2.6657 3.0702 0.2978 0.35739 0.542 0.77402 0.7437 1.1962 0.3755 0.78514 0.2793 1.561-0.1776 2.2925-0.4089 0.6555-0.9564 1.1925-1.5206 1.7017-2.2088 1.9962-4.4176 3.9924-6.6522 5.9607-0.5994 0.5296-1.2598 1.0037-1.9406 1.4222-1.282 0.7907-2.5676 0.6925-3.7368-0.2444-0.68076-0.5445-1.3208-1.1537-1.9054-1.8018-1.8832-2.0869-3.7312-4.2034-5.5922-6.3107-0.09434-0.1055-0.17944-0.2203-0.29043-0.3574v0.0019z"
                fill="currentColor"
              ></path>
              <path
                d="m39.574 0.91469h2.8082v15.225h-2.8082v-1.2832c-0.8269 1.0592-2.0034 1.5869-3.5259 1.5869-1.5224 0-2.7174-0.5555-3.7552-1.6647s-1.5558-2.4683-1.5558-4.0775c0-1.6092 0.518-2.9683 1.5558-4.0775s2.2883-1.6647 3.7552-1.6647c1.467 0 2.699 0.5296 3.5259 1.5869v-5.633 0.001852zm-5.1704 11.996c0.5735 0.5722 1.2949 0.8592 2.1662 0.8592s1.5891-0.287 2.1551-0.8592c0.5661-0.5722 0.8491-1.3092 0.8491-2.2072 0-0.89813-0.283-1.6351-0.8491-2.2073-0.566-0.57218-1.2838-0.8592-2.1551-0.8592s-1.5927 0.28702-2.1662 0.8592c-0.5735 0.57219-0.8602 1.3092-0.8602 2.2073 0 0.898 0.2867 1.635 0.8602 2.2072z"
                fill="currentColor"
              ></path>
              <path
                d="m51.766 5.2644h3.0043l-3.968 10.894c-0.5661 1.5536-1.3153 2.6813-2.2514 3.3849-0.9342 0.7037-2.0977 1.0203-3.4889 0.9463v-2.6091c0.7548 0.0148 1.3523-0.1445 1.7963-0.4778 0.4421-0.3333 0.7954-0.8703 1.0563-1.6091l-4.462-10.527h3.069l2.8377 7.3087 2.4086-7.3087-0.0019-0.00186z"
                fill="currentColor"
              ></path>
              <path
                d="m61.908 4.9589c1.1895 0 2.1736 0.39813 2.9487 1.1962 0.777 0.7981 1.1636 1.8999 1.1636 3.3054v6.6774h-2.8081v-6.3292c0-0.72403-0.1961-1.2796-0.5883-1.6647-0.3922-0.38331-0.9138-0.57589-1.5668-0.57589-0.7252 0-1.3061 0.22407-1.7408 0.67404s-0.653 1.124-0.653 2.0221v5.8718h-2.8081v-10.875h2.8081v1.2184c0.6826-1.0148 1.763-1.5221 3.2429-1.5221l0.0018 0.00185z"
                fill="currentColor"
              ></path>
              <path
                d="m76.243 5.2645h2.8081v10.875h-2.8081v-1.2833c-0.8417 1.0592-2.0238 1.5869-3.5481 1.5869s-2.6953-0.5555-3.7331-1.6647-1.5558-2.4683-1.5558-4.0775c0-1.6092 0.518-2.9683 1.5558-4.0775 1.0378-1.1092 2.2809-1.6647 3.7331-1.6647 1.5243 0 2.7064 0.5296 3.5481 1.5869v-1.2832 0.00185zm-5.1816 7.6458c0.5661 0.5722 1.2839 0.8592 2.1552 0.8592s1.5927-0.287 2.1662-0.8592c0.5734-0.5722 0.8602-1.3091 0.8602-2.2072 0-0.89813-0.2868-1.6351-0.8602-2.2073-0.5735-0.57219-1.2949-0.85921-2.1662-0.85921s-1.5891 0.28702-2.1552 0.85921c-0.566 0.57218-0.8491 1.3092-0.8491 2.2073 0 0.8981 0.2831 1.635 0.8491 2.2072z"
                fill="currentColor"
              ></path>
              <path
                d="m92.864 4.959c1.2487 0 2.2458 0.40553 2.9931 1.2184 0.7474 0.81291 1.1211 1.8999 1.1211 3.2628v6.6996h-2.8082v-6.5033c0-0.65182-0.1591-1.1592-0.4791-1.5221s-0.7696-0.54441-1.3504-0.54441c-0.6382 0-1.1359 0.2111-1.491 0.63144-0.3552 0.42035-0.5328 1.0296-0.5328 1.8276v6.1126h-2.8081v-6.5033c0-0.65181-0.1591-1.1592-0.4792-1.5221-0.32-0.36294-0.7695-0.54441-1.3504-0.54441-0.6234 0-1.121 0.2111-1.491 0.63144-0.37 0.42035-0.555 1.0296-0.555 1.8277v6.1126h-2.8081v-10.875h2.8081v1.1536c0.653-0.97216 1.6612-1.4573 3.0265-1.4573 1.3652 0 2.3216 0.52219 2.9598 1.5666 0.7251-1.0444 1.8073-1.5666 3.2428-1.5666l0.0019-0.00556z"
                fill="currentColor"
              ></path>
              <path
                d="m100.15 3.959c-0.4643 0-0.8676-0.17036-1.208-0.51108-0.3403-0.34072-0.5124-0.74255-0.5124-1.2073 0-0.46479 0.1702-0.87032 0.5124-1.2184 0.3404-0.34813 0.7437-0.52219 1.208-0.52219 0.464 0 0.888 0.17406 1.23 0.52219 0.341 0.34812 0.511 0.75365 0.511 1.2184 0 0.46478-0.17 0.86661-0.511 1.2073-0.34 0.34072-0.751 0.51108-1.23 0.51108zm-1.3929 12.181v-10.875h2.8079v10.875h-2.8079z"
                fill="currentColor"
              ></path>
              <path
                d="m108.69 16.443c-1.641 0-3.008-0.5499-4.103-1.6536-1.095-1.1017-1.643-2.4646-1.643-4.0886 0-1.624 0.548-2.9868 1.643-4.0886s2.464-1.6536 4.103-1.6536c1.06 0 2.024 0.25369 2.895 0.76107 0.871 0.50737 1.532 1.1888 1.981 2.0443l-2.416 1.4129c-0.218-0.44997-0.547-0.8055-0.989-1.0666-0.442-0.2611-0.94-0.39072-1.491-0.39072-0.842 0-1.539 0.27961-2.091 0.83698-0.551 0.55923-0.827 1.2721-0.827 2.1425 0 0.8703 0.276 1.5628 0.827 2.1202 0.552 0.5592 1.249 0.837 2.091 0.837 0.566 0 1.069-0.1259 1.513-0.3815 0.442-0.2537 0.773-0.6055 0.99-1.0555l2.438 1.3925c-0.479 0.8555-1.155 1.5407-2.024 2.0555-0.871 0.5147-1.835 0.7721-2.895 0.7721l-2e-3 0.0037z"
                fill="currentColor"
              ></path>
            </g>
            <defs>
              <clipPath id="a">
                <rect
                  transform="translate(0 .5)"
                  width="113.61"
                  height="20"
                  fill="#fff"
                ></rect>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};
