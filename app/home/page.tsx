"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CircleUserRound,
  ClipboardCopy,
  Power,
  Settings,
  Wallet,
} from "lucide-react";
import { Truncate } from "../utils/Truncate";
import CopyString from "../utils/CopyString";
import { useEffect, useState } from "react";
import { getSmartAccountClient } from "../lib/permissionless";
import { privateKeyToAccount } from "viem/accounts";
import { buildAutoSwap, buildEnableSmartSession, buildExecuteAutoSwap, buildOwnableModule, buildSmartSessionModule, buildUseSmartSession, sendOwnableTransaction, sendSessionTransaction, sendTransaction, Transaction } from "../lib/module";
import { Address, Hex, parseEther, WalletClient } from "viem";
import { SmartAccountClient } from "permissionless";
import { parseUnits, ZeroAddress } from "ethers";

export default function Page() {

  const { primaryWallet, handleLogOut } = useDynamicContext();
  const router = useRouter();

  const [ walletAddress, setWalletAddress ] = useState<Address>(ZeroAddress as Address);
  const [ accountClient, setAccountClient ] = useState<SmartAccountClient>();
  const [ account, setAccount ] = useState<WalletClient>();




  const chainId = 11235


  useEffect(() => {
    (async () => {  

      const account = await (primaryWallet as any)?.getWalletClient();
    
    const accountClient = await getSmartAccountClient({ signer: account,
            factoryAddress: "0xE8067f399052083d60e66Ef414ddB9f166E2C100",
          validatorAddress: "0x5aec3f1c43B920a4dc21d500617fb37B8db1992C",
      chainId: chainId.toString()});


    setAccount(account)
    setWalletAddress(accountClient?.account.address)
    setAccountClient(accountClient)


    })();
  }, [primaryWallet]);


  async function sendAsset() {

    const txHash = await sendTransaction(chainId.toString(), [
      { to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      value: parseEther("1"), data: '0x'}], account
    )


  }

  async function enableSmartSession() {

    const calls: Transaction[] = [];
 
    const buildSmartSession = await buildSmartSessionModule(chainId.toString(), accountClient?.account?.address!)
    if(buildSmartSession) {
      calls.push(buildSmartSession)
    }
    const autoSwap = await buildAutoSwap(chainId.toString(), walletAddress, "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", BigInt(100), ZeroAddress as Hex)
    const enableSmartSession = await buildEnableSmartSession(chainId.toString())
    const ownableModule = await buildOwnableModule(chainId.toString(), walletAddress)
    calls.push(enableSmartSession)
    calls.push(ownableModule!)
    const allCalls: Transaction[] = calls.concat(autoSwap)
    console.log(allCalls)
    const txHash = await sendTransaction(chainId.toString(), allCalls, account
    )
  }

  async function useSmartSession() {

    // const calls: Transaction[] = [{to: "0x0285F7b1bc7ef669f5F2554e8b0DaB0ab834Fc00", value: parseEther("1"), data: "0x"}];
 
    const calls: Transaction[] = [await buildExecuteAutoSwap("0xc2132D05D31c914a87C6611C10748AEb04B58e8F", parseUnits("2", 6))]
    const buildSmartSession = await buildUseSmartSession(chainId.toString())

    const txHash = await sendSessionTransaction(chainId.toString(), calls, account, walletAddress, buildSmartSession)
    
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white w-full">
      <div className="fancy-box max-w-md w-full bg-transparent rounded-xl">
        <Tabs
          defaultValue="account"
          className="bg-card flex flex-col justify-between items-center border-2 border-border rounded-xl w-full min-h-[35rem] h-full"
        >
          <div className="flex flex-col flex-grow px-6 py-5 w-full">
            <TabsContent value="account">
              <div className="bg-border w-full rounded-lg px-4 py-2 flex flex-row justify-start items-center flex-wrap gap-2">
                <h4 onClick={()=> { useSmartSession(); }} className="font-bold">Account: </h4>
                <div className="flex flex-row justify-start items-center gap-2">
                  {Truncate(walletAddress, 22, "...")}
                  <CopyString
                    copyText={walletAddress || ""}
                    icon={<ClipboardCopy size={20} />}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="profile">Profile here.</TabsContent>
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
                <CircleUserRound />
                <h3 className="text-sm">Profile</h3>
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
    </div>
  );
}
