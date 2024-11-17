"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CircleUserRound,
  ClipboardCopy,
  Plus,
  Power,
  QrCode,
  Replace,
  Settings,
  Wallet,
} from "lucide-react";
import { Truncate } from "../utils/truncate";
import CopyString from "../utils/CopyString";
import { useEffect, useState } from "react";

import { getSmartAccountClient } from "../lib/permissionless";
import { privateKeyToAccount } from "viem/accounts";
import {
  buildAutoSwap,
  buildEnableSmartSession,
  buildExecuteAutoSwap,
  buildOwnableModule,
  buildSmartSessionModule,
  buildUseSmartSession,
  sendOwnableTransaction,
  sendSessionTransaction,
  sendTransaction,
  Transaction,
} from "../lib/module";
import { Address, Hex, parseEther, WalletClient } from "viem";
import { SmartAccountClient } from "permissionless";
import { formatEther, parseUnits, ZeroAddress } from "ethers";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Tokens from "../utils/Tokens";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { getJsonRpcProvider } from "../lib/web3";
import { getChainById } from "../lib/tokens";
import { fixDecimal, getTokenBalance } from "../lib/utils";
import Loading from "../components/Loading";

export default function Page() {
  const router = useRouter();
  const { handleLogOut, primaryWallet, user } = useDynamicContext();

  const [walletAddress, setWalletAddress] = useState<Address>(
    ZeroAddress as Address
  );
  const [accountClient, setAccountClient] = useState<any>();
  const [account, setAccount] = useState<WalletClient>();
  const [showAutoSwap, setShowAutoSwap] = useState(false);
  const [percentage, setPercentage] = useState(100);
  const [fromToken, setFromToken] = useState(2);
  const [toToken, setToToken] = useState(5);
  const [showTx, setShowTx] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [tokenDetails, setTokenDetails]: any = useState([]);

  const chainId = 11235;
  // const chainId = 137

  useEffect(() => {
    (async () => {
      const account = await (primaryWallet as any)?.getWalletClient();

      const accountClient = await getSmartAccountClient({
        signer: account,
        factoryAddress: "0xE8067f399052083d60e66Ef414ddB9f166E2C100",
        validatorAddress: "0x5aec3f1c43B920a4dc21d500617fb37B8db1992C",
        chainId: chainId.toString(),
      });

      setAccount(account);
      setWalletAddress(accountClient?.account.address);
      setAccountClient(accountClient);
    })();
  }, [primaryWallet]);

  async function sendAsset() {
    const txHash = await sendTransaction(
      chainId.toString(),
      [
        {
          to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
          value: parseEther("1"),
          data: "0x",
        },
      ],
      account
    );
  }

  async function enableSmartSession() {
    const calls: Transaction[] = [];
    const buildSmartSession = await buildSmartSessionModule(
      chainId.toString(),
      accountClient?.account?.address!
    );
    if (buildSmartSession) {
      calls.push(buildSmartSession);
    }
    const autoSwap = await buildAutoSwap(
      chainId.toString(),
      walletAddress,
      tokenDetails[fromToken].address,
      tokenDetails[toToken].address,
      BigInt(100),
      ZeroAddress as Hex
    );
    const enableSmartSession = await buildEnableSmartSession(
      chainId.toString()
    );
    calls.push(enableSmartSession);
    const allCalls: Transaction[] = calls.concat(autoSwap);
    console.log(allCalls);
    const txHash = await sendTransaction(chainId.toString(), allCalls, account);
  }

  async function useSmartSession() {
    // const calls: Transaction[] = [{to: "0x0285F7b1bc7ef669f5F2554e8b0DaB0ab834Fc00", value: parseEther("1"), data: "0x"}];

    setShowTx(true);
    const calls: Transaction[] = [
      await buildExecuteAutoSwap(
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        parseUnits("100", 18)
      ),
    ];
    const buildSmartSession = await buildUseSmartSession(chainId.toString());

    const txHash = await sendSessionTransaction(
      chainId.toString(),
      calls,
      account,
      walletAddress,
      buildSmartSession
    );
    setShowTx(false);
  }

  useEffect(() => {
    (async () => {
      const provider = await getJsonRpcProvider(chainId.toString());
      let tokens = getChainById(Number(chainId))?.tokens;

      let updatedTokens = [];

      if (walletAddress) {
        updatedTokens = await Promise.all(
          tokens!.map(async (token) => {
            const balance =
              token.address == ZeroAddress
                ? formatEther(await provider.getBalance(walletAddress))
                : await getTokenBalance(
                    token.address!,
                    walletAddress,
                    provider
                  );

            return {
              ...token,
              balance, // Add the balance to each token
            };
          })
        );

        setTokenDetails(updatedTokens);
      }
    })();
  }, [chainId, walletAddress]);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [router, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white w-full">
      <div className="fancy-box max-w-md w-full bg-transparent rounded-xl">
        <Tabs
          defaultValue="account"
          className="bg-card flex flex-col justify-between items-center border-2 border-border rounded-xl w-full min-h-[35rem] h-full"
        >
          <div className="flex flex-col flex-grow justify-start items-start px-6 py-5 w-full">
            <TabsContent
              className="flex flex-col gap-4 mt-0 w-full"
              value="account"
            >
              <div className="bg-border w-full rounded-lg px-4 py-2 flex flex-col justify-start items-start flex-wrap gap-1">
                <div className="flex flex-col gap-1 justify-start items-start">
                  <div>
                    <h4 className="text-slate-500 text-sm">Balance</h4>
                    <h5 className="text-4xl font-black">
                      {fixDecimal(tokenDetails[0]?.balance, 4)} ETH
                    </h5>
                  </div>
                </div>

                <div className="flex flex-row justify-start items-center gap-2 text-sm text-slate-500">
                  {Truncate(walletAddress, 22, "...")}
                  <CopyString
                    copyText={walletAddress || ""}
                    icon={<ClipboardCopy size={16} />}
                  />
                  <QrCode size={16} />
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-grow overflow-hidden">
                <Tabs defaultValue="holdings" className="w-full">
                  <TabsList className=" bg-transparent p-0 grid grid-cols-2 gap-2 w-fit">
                    <TabsTrigger
                      onClick={async () => {
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        await useSmartSession();
                      }}
                      className="data-[state=active]:bg-border data-[state=active]:text-white data-[state=active]:font-bold"
                      value="holdings"
                    >
                      Holdings
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="holdings">
                    <div className="flex flex-col flex-grow divide-y divider-slate-500">
                      {tokenDetails.map((token: any) => (
                        <div
                          key={token.toString()}
                          className="flex flex-row justify-between items-center py-2"
                        >
                          <div className="flex flex-row justify-start items-center gap-2">
                            <Image
                              src={token.icon}
                              alt="token"
                              height={30}
                              width={30}
                            />
                            <h4 className="font-medium">{token.name}</h4>
                          </div>
                          <div> {fixDecimal(token.balance, 4)}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
            <TabsContent
              className="flex flex-col gap-4 mt-0 w-full"
              value="profile"
            >
              <div className="flex flex-row justify-between items-center w-full">
                <h2 className="font-bold text-lg">Auto Swaps</h2>
                <button
                  onClick={() => setShowAutoSwap(true)}
                  className="bg-slate-500 text-white text-sm px-2 py-1 rounded-lg flex flex-row justify-center items-center gap-1"
                >
                  <Plus size={12} /> Auto Swap
                </button>
              </div>
              <div className="flex flex-col flex-grow overflow-y-scroll divide-y divider-slate-500">
                <div className="flex flex-row justify-between items-center py-2">
                  <div className="flex flex-row justify-start items-center gap-4">
                    <div className="flex flex-row justify-start items-center gap-1">
                      <Image
                        src={tokenDetails[2]?.icon}
                        alt="token"
                        height={30}
                        width={30}
                      />
                      <h4 className="font-medium">{tokenDetails[2]?.name}</h4>
                    </div>
                    <Image
                      src="/pacman.png"
                      alt="Logo"
                      width={20}
                      height={20}
                    />
                    <div className="flex flex-row justify-start items-center gap-1">
                      <Image
                        src={tokenDetails[5]?.icon}
                        alt="token"
                        height={30}
                        width={30}
                      />
                      <h4 className="font-medium">{tokenDetails[5]?.name}</h4>
                    </div>{" "}
                  </div>
                  <div>0.00</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="flex flex-grow">
              <div className="flex flex-col flex-grow justify-between items-start gap-4 w-full">
                <div>Settings</div>
                <button
                  onClick={() => {
                    handleLogOut();
                    router.push("/");
                  }}
                  className="bg-red-200 text-red-600 flex flex-row justify-center items-center gap-4 w-full px-4 py-2.5 rounded-lg border-2 border-border font-semibold"
                >
                  <Power /> Logout
                </button>
              </div>
            </TabsContent>
          </div>

          <TabsList className="w-full rounded-b-lg rounded-t-none bg-border grid grid-cols-3 gap-2 h-fit">
            <TabsTrigger
              className=" data-[state=active]:bg-transparent data-[state=active]:text-white"
              value="account"
            >
              <div className="flex flex-col items-center gap-1">
                <Wallet />
                <h3 className="text-sm">Wallet</h3>
              </div>
            </TabsTrigger>
            <TabsTrigger
              className=" data-[state=active]:bg-transparent data-[state=active]:text-white"
              value="profile"
            >
              <div className="flex flex-col items-center gap-1">
                <Replace />
                <h3 className="text-sm">Auto Swap</h3>
              </div>
            </TabsTrigger>
            <TabsTrigger
              className=" data-[state=active]:bg-transparent data-[state=active]:text-white"
              value="settings"
            >
              <div className="flex flex-col items-center gap-1">
                <Settings />
                <h3 className="text-sm">Settings</h3>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Dialog open={showAutoSwap} onOpenChange={setShowAutoSwap}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Auto Swap</DialogTitle>
            <DialogDescription>
              Fill in the information below to create an auto swap.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6 w-full text-white">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm" htmlFor="">
                Select Swap Tokens
              </label>
              <div className="flex flex-row justify-center items-center gap-4">
                <Select
                  value={fromToken.toString()}
                  onValueChange={(value) => {
                    setFromToken(parseInt(value));
                  }}
                >
                  <SelectTrigger className="w-full bg-border focus:outline-none focus:ring-0">
                    <SelectValue placeholder="In Token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokenDetails.map((token: any, t: any) => (
                      <SelectItem key={t} value={t.toString()}>
                        <div className="flex flex-row justify-center items-center gap-2">
                          <Image
                            src={token.icon}
                            alt="Logo"
                            width={20}
                            height={20}
                          />
                          <div>{token.name}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Image
                  src={"/pacman.png"}
                  alt="Pacman"
                  width={20}
                  height={20}
                />
                <Select
                  value={toToken.toString()}
                  onValueChange={(value) => {
                    setToToken(parseInt(value));
                  }}
                >
                  <SelectTrigger className="w-full bg-border focus:outline-none focus:ring-0">
                    <SelectValue placeholder="Out Token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokenDetails.map((token: any, t: any) => (
                      <SelectItem key={t} value={t.toString()}>
                        <div className="flex flex-row justify-center items-center gap-2">
                          <Image
                            src={token.icon}
                            alt="Logo"
                            width={20}
                            height={20}
                          />
                          <div>{token.name}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm" htmlFor="">
                Percentage to swap ({percentage}%)
              </label>
              <Slider
                defaultValue={[percentage]}
                max={100}
                step={1}
                onValueChange={(e) => {
                  setPercentage(e[0]);
                }}
              />
            </div>
            <button
              onClick={async () => {
                setEnabling(true);
                await enableSmartSession();
                setEnabling(false);
              }}
              className="bg-red-200 text-red-600 flex flex-row justify-center items-center gap-4 w-full px-4 py-2.5 rounded-lg border-2 border-border font-semibold mt-4"
            >
              {enabling ? <Loading /> : "Create Auto Swap"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showTx} onOpenChange={setShowTx}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Incoming Transaction</DialogTitle>
            <DialogDescription>
              We are swapping your incoming token to desired token.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 place-items-center gap-4 text-white text-center my-4">
            <div className="flex flex-col justify-center items-center gap-2">
              <div className="bg-white rounded-full flex flex-row justify-center items-center gap-2">
                <Image
                  src={tokenDetails[fromToken]?.icon}
                  alt={tokenDetails[fromToken]?.name}
                  width={60}
                  height={60}
                />
              </div>
              <h3 className="font-bold">{Tokens[0].symbol}</h3>
            </div>
            <div className="flex flex-col justify-center items-center gap-4">
              <Image src="/pacman.gif" alt="Pacman" width={40} height={40} />
              <Link href={"/"} target="_blank" className="underline text-sm">
                View on Blockscan
              </Link>
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
              <div className="bg-white rounded-full flex flex-row justify-center items-center gap-2">
                <Image
                  src={tokenDetails[toToken]?.icon}
                  alt={tokenDetails[toToken]?.name}
                  width={60}
                  height={60}
                />
              </div>
              <h3 className="font-bold">{Tokens[1].symbol}</h3>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
