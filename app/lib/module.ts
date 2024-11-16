import { Contract, dataSlice, formatUnits, getAddress, getBytes, id, Interface, parseUnits, ZeroAddress } from "ethers";
import { getJsonRpcProvider } from "./web3";
import {  Address, Hex, SendTransactionParameters, createPublicClient, encodeAbiParameters, pad, http, toHex, concat, toBytes, SignableMessage, Account, LocalAccount, encodePacked, toFunctionSelector } from "viem";
import {
    getClient,
    getModule,
    getAccount,
    installModule,
    isModuleInstalled,
    ModuleType,
    getSudoPolicy,
    Session,
    OWNABLE_VALIDATOR_ADDRESS,
    encodeValidationData,
    getOwnableValidatorMockSignature,
    SmartSessionMode,
    EnableSessionData,
    getSpendingLimitsPolicy,
    ActionData,
    encodeValidatorNonce,
    getSmartSessionsValidator,
    getOwnableValidator,
  } from "@rhinestone/module-sdk";
import { NetworkUtil } from "./networks";
import AutoSwapExecutor from "./abis/AutoSwapExecutor.json";
import SpendingLimitPolicy from "./abis/SpendingLimitPolicy.json";
import SessionValidator from "./abis/SessionValidator.json";
import { computeConfigId, decodeSmartSessionSignature, encodeSmartSessionSignature, getActionId, getEnableSessionDetails, getEnableSessionsAction, getPermissionId, SMART_SESSIONS_ADDRESS } from "./smartsessions/smartsessions";
import { SmartSessionModeType } from "./smartsessions/types";


import {getChain, getSmartAccountClient } from "./permissionless";
import { buildTransferToken, getRedeemBalance, getTokenDecimals, getVaultBalance, getVaultRedeemBalance, publicClient } from "./utils";
import { getPackedUserOperation } from "permissionless";
import { getAccountNonce } from 'permissionless/actions'



// export const webAuthnModule = "0xD990393C670dCcE8b4d8F858FB98c9912dBFAa06"
export const webAuthnModule = "0xD990393C670dCcE8b4d8F858FB98c9912dBFAa06"
export const passkeySessionValidator = "0xA66C14045a68232B0d3aC75566C449A9167F8583"
export const autoSwapExecutor = "0x0285F7b1bc7ef669f5F2554e8b0DaB0ab834Fc00"
export const sessionValidator = "0x8D4Bd3f21CfE07FeDe4320F1DA44F5d5d9b9952C"
export const validatorAccount = "0xC70548d74f4A93a25b7d4754Bf536282971832c6"
export const spendLimitPolicy = "0xED0FbC27Ca0D7e48F4aB40b1F88f74B7F6118884"
export const smartSession = SMART_SESSIONS_ADDRESS
import { getChainId, signMessage as signMessageViem } from "viem/actions"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";
import { entryPoint07Address, getUserOperationHash, UserOperation } from "viem/account-abstraction";


export interface Transaction {
  to: Hex;
  value: bigint;
  data: Hex;
}

export const getWebAuthnModule = async (validator: any) => {

  
  return { address: webAuthnModule as Address,
     context: await validator.getEnableData()}

}

export const getDetails = async (): Promise<{ address: Address }> => {
  // Replace with your logic to retrieve the address
  const address = "0x8D4Bd3f21CfE07FeDe4320F1DA44F5d5d9b9952C"; // Example address
  return { address };
}


export const getSessionValidatorAccount = async () => {

  const validator = privateKeyToAccount("0x47cfffe655129fa5bce61a8421eb6ea97ec6d5609b5fbea45ad68bacede19d8b")
  return validator;


}

export  function getSessionValidatorDetails() {
   
  return { address: OWNABLE_VALIDATOR_ADDRESS, initData: encodeValidationData({
      threshold: 1,
      owners: [validatorAccount],
      })}
}




export const getSpendPolicy = async (chainId: string, configId: string, token: Address, account: Address): Promise<any> => {


  const provider = await getJsonRpcProvider(chainId)

  const spendLimit = new Contract(
      spendLimitPolicy,
      SpendingLimitPolicy.abi,
      provider
  )

  const sesionData = await spendLimit.getPolicy(smartSession, configId, token, account);
  console.log(sesionData)
  return sesionData;
}

// export const getSessionData = async (chainId: string, sessionId: string): Promise<any> => {


//   const provider = await getJsonRpcProvider(chainId)
//   const  { address} = await getDetails()


//   const autoDCA = new Contract(
//       autoDCAExecutor,
//       AutoSwapExecutor.abi,
//       provider
//   )

//   const sesionData = await autoDCA.getJobData(address);
//   return sesionData;
// }


// export const getAllJobs = async (chainId: string, safeAccount: string): Promise<any> => {


//   const provider = await getJsonRpcProvider(chainId)

//   const autoDCA = new Contract(
//       autoDCAExecutor,
//       AutoSwapExecutor.abi,
//       provider
//   )

//   const jobData = await autoDCA.getJobData(safeAccount);
//   return jobData;
// }

async function toSessionkeyAccount(
  chainId: number,
  signerAccount: any,
  sessionDetails?: {
    mode: SmartSessionModeType;
    permissionId: Hex;
    enableSessionData?: EnableSessionData;
  }
) {
  const client = publicClient(chainId);

  const signMessage = ({ message }: { message: SignableMessage }): Promise<Hex> => {
    return signMessageViem(client, { account: signerAccount, message: message });
  };

  const signUserOperation = async (userOperation: UserOperation<"0.7">) => {
    const signature = await signMessage({
      message: {
        raw: getUserOperationHash({
          userOperation,
          entryPointAddress: entryPoint07Address,
          entryPointVersion: "0.7",
          chainId: chainId,
        }),
      },
    });

    if (!sessionDetails) {
      throw new Error("Session details are required for session transactions");
    }

    return encodeSmartSessionSignature({
      mode: sessionDetails.mode,
      permissionId: sessionDetails.permissionId,
      signature,
      enableSessionData: sessionDetails.enableSessionData,
    });
  };

  const getDummySignature = async () => {


    const signature = getOwnableValidatorMockSignature({
      threshold: 1,
    });

    if (!sessionDetails) {
      throw new Error("Session details are required for session transactions");
    }

    return encodeSmartSessionSignature({
      mode: sessionDetails.mode,
      permissionId: sessionDetails.permissionId,
      signature,
      enableSessionData: sessionDetails.enableSessionData,
    });
  };

  return {
    signMessage,
    signUserOperation,
    getDummySignature,
  };
}




export const sendTransaction = async (chainId: string, calls: Transaction[], signer: any, safeAccount?: Hex, transactionType: "normal" | "session" = "normal", sessionDetails?:  {
    mode: SmartSessionModeType
    permissionId: Hex
    enableSessionData?: EnableSessionData
  }): Promise<any> => {


    console.log(await getSessionValidatorAccount())

    const key = BigInt(pad(smartSession as Hex, {
        dir: "right",
        size: 24,
      }) || 0
    )


    const signingAccount = await toSessionkeyAccount(parseInt(chainId), signer, sessionDetails)
    

    if (!signingAccount) {
      throw new Error('Signing account is undefined');
    }

    let smartAccount;
    if(transactionType == "normal") {

       smartAccount = await getSmartAccountClient({
        chainId,
        signer,
        factoryAddress: "0xE8067f399052083d60e66Ef414ddB9f166E2C100",
        validatorAddress: "0x5aec3f1c43B920a4dc21d500617fb37B8db1992C"
      });

    }
    else {

       smartAccount = await getSmartAccountClient({
        chainId,
        nonceKey: key,
        address: safeAccount,
        signUserOperation: signingAccount.signUserOperation,
        getDummySignature: signingAccount.getDummySignature,
        factoryAddress: "0xE8067f399052083d60e66Ef414ddB9f166E2C100",
        validatorAddress: "0x5aec3f1c43B920a4dc21d500617fb37B8db1992C"
      });


    }

    return await smartAccount.sendUserOperation({ calls: calls });
}



export const sendOwnableTransaction = async (chainId: string, calls: Transaction[], signer: any, safeAccount: Hex,  sessionDetails:  {
  mode: SmartSessionModeType
  permissionId: Hex,
  signature: Hex,
  enableSessionData?: EnableSessionData
}): Promise<any> => {



  const key = BigInt(pad(OWNABLE_VALIDATOR_ADDRESS as Hex, {
      dir: "right",
      size: 24,
    }) || 0
  )
  const client = publicClient(parseInt(chainId));

  



  const account = getAccount({
    address: safeAccount,
    type: 'nexus',
  })


  const owner = getSessionValidatorDetails()
  const ownable = getOwnableValidator({threshold: 1, owners: [owner.address]})


  const nonce = await getAccountNonce(client, {
    address: safeAccount,
    entryPointAddress: entryPoint07Address,
    key: encodeValidatorNonce({
      account,
      validator: ownable,
    }),
  })
 

  const smartAccount = await getSmartAccountClient({
      chainId,
      signer: signer,
      address: safeAccount,
      // factoryAddress: "0xE8067f399052083d60e66Ef414ddB9f166E2C100",
      // validatorAddress: "0x5aec3f1c43B920a4dc21d500617fb37B8db1992C"
    });

    

    const userOperation = await smartAccount.prepareUserOperation({calls , nonce, signature: getOwnableValidatorMockSignature({
      threshold: 1,
    }) });

  //   const userOpHashToSign = getUserOperationHash({
  //     chainId: parseInt(chainId),
  //     entryPointAddress: entryPoint07Address,
  //     entryPointVersion: '0.7',
  //     userOperation,
  //   })
     
  //   const sessionOwner = await getSessionValidatorAccount()
  //   sessionDetails.signature = await sessionOwner.signMessage({
  //     message: { raw: userOpHashToSign },
  //   })

    
     
  //   userOperation.signature = encodeSmartSessionSignature(sessionDetails)

  // return await smartAccount.sendUserOperation(userOperation);
}


export const sendSessionTransaction = async (chainId: string, calls: Transaction[], signer: any, safeAccount: Hex,  sessionDetails:  {
  mode: SmartSessionModeType
  permissionId: Hex,
  signature: Hex,
  enableSessionData?: EnableSessionData
}): Promise<any> => {



  const key = BigInt(pad(smartSession as Hex, {
      dir: "right",
      size: 24,
    }) || 0
  )
  const client = publicClient(parseInt(chainId));

  const nonce = await getAccountNonce(client, {
    address: safeAccount,
    entryPointAddress: entryPoint07Address,
    key: key,
  })
   


  const signingAccount = await toSessionkeyAccount(parseInt(chainId), signer, sessionDetails)
  

  sessionDetails.signature = getOwnableValidatorMockSignature({
    threshold: 1,
  })

  const smartAccount = await getSmartAccountClient({
      chainId,
      signer: signer,
      address: safeAccount,
      factoryAddress: "0xE8067f399052083d60e66Ef414ddB9f166E2C100",
      validatorAddress: "0x5aec3f1c43B920a4dc21d500617fb37B8db1992C"
    });

    const userOperation = await smartAccount.prepareUserOperation({calls , nonce, signature: encodeSmartSessionSignature(sessionDetails) });

    const userOpHashToSign = getUserOperationHash({
      chainId: parseInt(chainId),
      entryPointAddress: entryPoint07Address,
      entryPointVersion: '0.7',
      userOperation,
    })
     
    const sessionOwner = await getSessionValidatorAccount()
    sessionDetails.signature = await sessionOwner.signMessage({
      message: { raw: userOpHashToSign },
    })

    
     
    userOperation.signature = encodeSmartSessionSignature(sessionDetails)

  return await smartAccount.sendUserOperation(userOperation);
}





export const buildAutoSwap = async (chainId: string,  accuont: Address, fromToken: Address, targetToken: Address, percentage: bigint, to: Address): Promise<Transaction[]> => {

    
  const provider = await getJsonRpcProvider(chainId);


  const autoSwap = new Contract(
      autoSwapExecutor,
      AutoSwapExecutor.abi,
      provider
  )

  const calls: Transaction[] = []
  if(!await isInstalled(parseInt(chainId), accuont, autoSwapExecutor, "executor")){

    console.log("Installing new autoSwapExecutor")
    
    calls.push(await buildInstallModule(parseInt(chainId), accuont, autoSwapExecutor, "executor", "0x" ))

  }

  calls.push({
      to: autoSwapExecutor,
      value: BigInt(0),
      data: (await autoSwap.createConfig.populateTransaction(fromToken, targetToken, percentage, to)).data as Hex
  })

  return calls;
}

export const buildSmartSessionModule = async (chainId: string, safeAccount: Address): Promise<Transaction | undefined> => {

    
  if(!await isInstalled(parseInt(chainId), safeAccount, smartSession, "validator")){
    
    return await buildInstallModule(parseInt(chainId), safeAccount, smartSession, "validator", "0x" )

  }
}


export const buildOwnableModule = async (chainId: string, safeAccount: Address): Promise<Transaction | undefined> => {

  
  const sessionValidator = getSessionValidatorDetails()
  if(!await isInstalled(parseInt(chainId), safeAccount, OWNABLE_VALIDATOR_ADDRESS, "validator")){
    
    return await buildInstallModule(parseInt(chainId), safeAccount, OWNABLE_VALIDATOR_ADDRESS, "validator", sessionValidator.initData )

  }
  else{
    console.log('instllaed')
  }
}



export const buildExecuteAutoSwap = async (token: Address, amount: bigint): Promise<Transaction> => {

  
  const execCallData = new Interface(AutoSwapExecutor.abi).encodeFunctionData('autoSwap', [token, amount])

  return {
      to: autoSwapExecutor,
      value: BigInt(0),
      data: execCallData as Hex
  }
}



export const buildUseSmartSession = async (chainId: string): Promise<{
  mode: SmartSessionModeType
  permissionId: Hex
  signature: Hex
  enableSessionData?: EnableSessionData
}> => {
 

        const validator = getSessionValidatorDetails()

        const session: Session = {
          sessionValidator: validator.address,
          sessionValidatorInitData:  validator.initData,
          salt: toHex(toBytes('1', { size: 32 })),
          userOpPolicies: [],
          erc7739Policies: {
            allowedERC7739Content: [],
            erc1271Policies: [],
          },
          actions: [],
          chainId: BigInt(chainId),
        }

        const sessionDetails = { permissionId: getPermissionId({session}), mode: SmartSessionMode.USE, signature: '0x' as Hex }

        return sessionDetails;
}



export const buildEnableSmartSession = async (chainId: string): Promise<Transaction> => {

    
        const execCallSelector = toFunctionSelector({
          name: 'autoSwap',
          type: 'function',
          inputs: [{ name: 'token', type: 'address' }, { name: 'amountReceived', type: 'uint256' }],
          outputs: [],
          stateMutability: 'view',
        })


        const validator = getSessionValidatorDetails()

        const session: Session = {
          sessionValidator: validator.address,
          sessionValidatorInitData: validator.initData,
          salt: toHex(toBytes('1', { size: 32 })),
          userOpPolicies: [],
          erc7739Policies: {
            allowedERC7739Content: [],
            erc1271Policies: [],
          },
          actions: [
            {
              actionTarget: autoSwapExecutor as Address, // an address as the target of the session execution
              actionTargetSelector: execCallSelector as Hex, // function selector to be used in the execution, in this case no function selector is used
              actionPolicies: [{policy: "0x10C917bc684Af33e10843061022346E72c943e3c", initData: "0x"}],
            },
          ],
          chainId: BigInt(chainId),
        }

        const action = getEnableSessionsAction({ sessions: [session]})

  return {
      to: action.to,
      value: BigInt(0),
      data: action.data
  }
}






export const buildInstallModule = async (chainId: number, safeAccount: Address, address: Address, type: ModuleType, initData: Hex): Promise<Transaction> => {


    const client = getClient({ rpcUrl: NetworkUtil.getNetworkById(chainId)?.url!});

    // Create the account object
    const account = getAccount({
            address: safeAccount,
            type: "safe",
        });


    const accountModule = getModule({
        module: address,
        initData: initData,
        type:  type,
      });

    const executions = await installModule({
        client,
        account,
        module: accountModule,
      });
  

      return {to: executions[0].target, value: BigInt(executions[0].value.toString()) , data: executions[0].callData}

}



export const isInstalled = async (chainId: number, safeAddress: Address, address: Address, type: ModuleType): Promise<boolean> => {



    const client = getClient({ rpcUrl: NetworkUtil.getNetworkById(chainId)?.url!});


    // Create the account object
    const account = getAccount({
            address: safeAddress,
            type: "safe",
        });


    const accountModule = getModule({
        module: address,
        initData: '0x',
        type:  type ,
      });

     
    try {  
    return await isModuleInstalled({
        client,
        account,
        module: accountModule,
      });
    }
    catch {
        return false;
    }

}
