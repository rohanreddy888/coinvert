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
import { Truncate } from "../utils/truncate";
import CopyString from "../utils/CopyString";
import { useEffect, useState } from "react";
import { getSmartAccountClient } from "../lib/permissionless";
import { privateKeyToAccount } from "viem/accounts";
import { sendTransaction } from "../lib/module";
import { parseEther, WalletClient } from "viem";
import { SmartAccountClient } from "permissionless";

export default function Page() {

  const { primaryWallet, handleLogOut } = useDynamicContext();
  const router = useRouter();

  const [ walletAddress, setWalletAddress ] = useState("");
  const [ accountClient, setAccountClient ] = useState<SmartAccountClient>();
  const [ account, setAccount ] = useState<WalletClient>();




  const chainId = 84532


  useEffect(() => {
    (async () => {  

    const account = await primaryWallet?.getWalletClient()

    // getSmartAccountClient()
    const _validator = privateKeyToAccount("0x47cfffe655129fa5bce61a8421eb6ea97ec6d5609b5fbea45ad68bacede19d8b")
    // const _validator = await connectPasskeyValidator(chainId.toString(), passkey);
    
    const accountClient = await getSmartAccountClient({ signer: account,
            // factoryAddress: "0xE8067f399052083d60e66Ef414ddB9f166E2C100",
          // validatorAddress: "0x5aec3f1c43B920a4dc21d500617fb37B8db1992C",
      chainId: chainId.toString()});


    setAccount(account)
    setWalletAddress(accountClient?.account.address)
    setAccountClient(accountClient)


    })();
  }, [primaryWallet]);


  async function sendAsset() {

    const txHash = await sendTransaction(chainId.toString(), [
      { to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      value: parseEther("0.00001"), data: '0x'}], account
    )


  }

  async function enable() {

    const txHash = await sendTransaction(chainId.toString(), [
      { to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      value: parseEther("0.00001"), data: '0x'}], account
    )


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
                <h4 onClick={()=> { sendAsset(); }} className="font-bold">Account: </h4>
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
