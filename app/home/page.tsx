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

export default function Page() {
  const router = useRouter();
  const { handleLogOut, primaryWallet } = useDynamicContext();
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
                <h4 className="font-bold">Account: </h4>
                <div className="flex flex-row justify-start items-center gap-2">
                  {Truncate(primaryWallet?.address, 22, "...")}
                  <CopyString
                    copyText={primaryWallet?.address || ""}
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
