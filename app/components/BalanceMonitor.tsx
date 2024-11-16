"use client"; 

import React, { useState, useEffect } from "react";
import { ethers, parseUnits } from "ethers";
import { getJsonRpcProvider } from "../lib/web3";
import { getRawTokenBalance, getTokenBalance } from "../lib/utils";
import { buildExecuteAutoSwap, buildUseSmartSession, getSessionValidatorAccount, sendSessionTransaction, Transaction } from "../lib/module";

const BalanceMonitor: React.FC = () => {
  // Replace with your provider, token address, and wallet address
  const tokenAddress = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // Replace with the token contract address
  const walletAddress = "0x24481e48907C08ae728eb20bDB08F35144b8D406"; // Replace with the wallet address to monitor


  // State variables for balance monitoring
  const [updatedBalance, setUpdatedBalance] = useState<BigInt>(BigInt(0));
  const [previousBalance, setPreviousBalance] = useState<BigInt>(BigInt(0));

  const chainId = 11235

  // Function to check the token balance
  const checkBalance = async () => {
    try {



    console.log("checking")

    const provider = await getJsonRpcProvider(chainId.toString());
      const {balance, decimals} = await getRawTokenBalance(tokenAddress, walletAddress, provider);

      console.log(balance)
      if (balance >= previousBalance) {
        console.log("Balance increased!");
        await useSmartSession(balance )

      }

      setPreviousBalance(updatedBalance); // Update the previous balance
      setUpdatedBalance(balance); // Update the current balance
    } catch (error) {
      console.error("Error checking balance:", error);
    }
  };


  async function useSmartSession(amount: bigint) {

    // const calls: Transaction[] = [{to: "0x0285F7b1bc7ef669f5F2554e8b0DaB0ab834Fc00", value: parseEther("1"), data: "0x"}];
 
    const calls: Transaction[] = [await buildExecuteAutoSwap("0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", amount)]
    const buildSmartSession = await buildUseSmartSession(chainId.toString())

    const sessionOwner = await getSessionValidatorAccount()

    const txHash = await sendSessionTransaction(chainId.toString(), calls, sessionOwner, walletAddress, buildSmartSession)
    
  }



  // Polling effect
  useEffect(() => {

    console.log('asdasdasd')
    const interval = setInterval(checkBalance, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []); // No need to depend on balance updates

  return (
    <div>
    </div>
  );
};

export default BalanceMonitor;
