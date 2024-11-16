"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardCopy,
  Plus,
  Power,
  QrCode,
  Replace,
  Settings,
  Wallet,
} from "lucide-react";
import { Truncate } from "../utils/Truncate";
import CopyString from "../utils/CopyString";
import { useEffect, useState } from "react";
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

export default function Page() {
  const router = useRouter();
  const { handleLogOut, primaryWallet, user } = useDynamicContext();
  const [showAutoSwap, setShowAutoSwap] = useState(false);
  const [percentage, setPercentage] = useState(33);
  const [showTx, setShowTx] = useState(true);

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
                    <h5 className="text-4xl font-black">0 ETH</h5>
                  </div>
                </div>

                <div className="flex flex-row justify-start items-center gap-2 text-sm text-slate-500">
                  {Truncate(primaryWallet?.address, 22, "...")}
                  <CopyString
                    copyText={primaryWallet?.address || ""}
                    icon={<ClipboardCopy size={16} />}
                  />
                  <QrCode size={16} />
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-grow">
                <Tabs defaultValue="holdings" className="w-[400px]">
                  <TabsList className=" bg-transparent p-0 grid grid-cols-2 gap-2 w-fit">
                    <TabsTrigger
                      className="data-[state=active]:bg-border data-[state=active]:text-white data-[state=active]:font-bold"
                      value="holdings"
                    >
                      Holdings
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="holdings">
                    <div className="flex flex-col flex-grow overflow-y-scroll divide-y divider-slate-500">
                      <div className="flex flex-row justify-between items-center py-2">
                        <div className="flex flex-row justify-start items-center gap-1">
                          <h4 className="font-medium">ETH</h4>
                        </div>
                        <div>0.00</div>
                      </div>
                      <div className="flex flex-row justify-between items-center py-2">
                        <div className="flex flex-row justify-start items-center gap-1">
                          <h4 className="font-medium">ETH</h4>
                        </div>
                        <div>0.00</div>
                      </div>
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
                  <div className="flex flex-row justify-start items-center gap-2">
                    <h4 className="font-medium">ETH</h4>
                    <Image
                      src="/pacman.png"
                      alt="Logo"
                      width={20}
                      height={20}
                    />
                    <h4 className="font-medium">ETH</h4>
                  </div>
                  <div>0.00</div>
                </div>
                <div className="flex flex-row justify-between items-center py-2">
                  <div className="flex flex-row justify-start items-center gap-2">
                    <h4 className="font-medium">ETH</h4>
                    <Image
                      src="/pacman.png"
                      alt="Logo"
                      width={20}
                      height={20}
                    />
                    <h4 className="font-medium">ETH</h4>
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
                <Select>
                  <SelectTrigger className="w-full bg-border focus:outline-none focus:ring-0">
                    <SelectValue placeholder="In Token" />
                  </SelectTrigger>
                  <SelectContent>
                    {Tokens.map((token, t) => (
                      <SelectItem key={t} value={token.symbol}>
                        <div className="flex flex-row justify-center items-center gap-2">
                          <Image
                            src={token.logoURI}
                            alt="Logo"
                            width={20}
                            height={20}
                          />
                          <div>{token.symbol}</div>
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
                <Select>
                  <SelectTrigger className="w-full bg-border focus:outline-none focus:ring-0">
                    <SelectValue placeholder="Out Token" />
                  </SelectTrigger>
                  <SelectContent>
                    {Tokens.map((token, t) => (
                      <SelectItem key={t} value={token.symbol}>
                        <div className="flex flex-row justify-center items-center gap-2">
                          <Image
                            src={token.logoURI}
                            alt="Logo"
                            width={20}
                            height={20}
                          />
                          <div>{token.symbol}</div>
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
                defaultValue={[33]}
                max={100}
                step={1}
                onValueChange={(e) => {
                  setPercentage(e[0]);
                }}
              />
            </div>
            <button className="bg-red-200 text-red-600 flex flex-row justify-center items-center gap-4 w-full px-4 py-2.5 rounded-lg border-2 border-border font-semibold mt-4">
              Create Auto Swap
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
                  src={Tokens[0].logoURI}
                  alt={Tokens[0].symbol}
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
                  src={Tokens[1].logoURI}
                  alt={Tokens[1].symbol}
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
