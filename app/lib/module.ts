import { Contract, dataSlice, formatUnits, getAddress, getBytes, id, Interface, parseUnits } from "ethers";
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
  } from "@rhinestone/module-sdk";
import { NetworkUtil } from "./networks";
import AutoDCAExecutor from "./abis/AutoDCAExecutor.json";
import SpendingLimitPolicy from "./abis/SpendingLimitPolicy.json";
import SessionValidator from "./abis/SessionValidator.json";
import { computeConfigId, decodeSmartSessionSignature, encodeSmartSessionSignature, getActionId, getEnableSessionDetails, getEnableSessionsAction, getPermissionId, SMART_SESSIONS_ADDRESS } from "./smartsessions/smartsessions";
import { SmartSessionModeType } from "./smartsessions/types";


import {getChain, getSmartAccountClient } from "./permissionless";
import { buildTransferToken, getRedeemBalance, getTokenDecimals, getVaultBalance, getVaultRedeemBalance, publicClient } from "./utils";
import { getPackedUserOperation } from "permissionless";


// export const webAuthnModule = "0xD990393C670dCcE8b4d8F858FB98c9912dBFAa06"
export const webAuthnModule = "0xD990393C670dCcE8b4d8F858FB98c9912dBFAa06"
export const passkeySessionValidator = "0xA66C14045a68232B0d3aC75566C449A9167F8583"
export const autoDCAExecutor = "0xA0276A0847cf114DD16c435510DAA67bC70Ee344"
export const sessionValidator = "0x8D4Bd3f21CfE07FeDe4320F1DA44F5d5d9b9952C"
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

export const getSessionData = async (chainId: string, sessionId: string): Promise<any> => {


  const provider = await getJsonRpcProvider(chainId)
  const  { address} = await getDetails()


  const autoDCA = new Contract(
      autoDCAExecutor,
      AutoDCAExecutor.abi,
      provider
  )

  const sesionData = await autoDCA.getJobData(address);
  return sesionData;
}


export const getAllJobs = async (chainId: string, safeAccount: string): Promise<any> => {


  const provider = await getJsonRpcProvider(chainId)

  const autoDCA = new Contract(
      autoDCAExecutor,
      AutoDCAExecutor.abi,
      provider
  )

  const jobData = await autoDCA.getJobData(safeAccount);
  return jobData;
}

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


    console.log(transactionType, sessionDetails)

    const key = BigInt(pad(transactionType == "normal" ? webAuthnModule : smartSession as Hex, {
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
        // factoryAddress: "0xE8067f399052083d60e66Ef414ddB9f166E2C100",
        // validatorAddress: "0x5aec3f1c43B920a4dc21d500617fb37B8db1992C"
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




export const buildAddSessionKey = async (chainId: string, safeAccount: Address): Promise<Transaction[]> => {

  const  { address } = await getDetails()
  const execCallData = new Interface(AutoDCAExecutor.abi).encodeFunctionData('executeJob', [0])
  const currentTime = Math.floor(Date.now()/1000)
  const sessionKeyData = { target: autoDCAExecutor as Hex, funcSelector: execCallData.slice(0, 10) as Hex, validAfter: 0, validUntil: currentTime + 86400, active: true }


  const provider = await getJsonRpcProvider(chainId);

  const sessionKeyValidator = new Contract(
       sessionValidator,
       SessionValidator.abi,
      provider
  )

  const calls: Transaction[] = []
  if(!await isInstalled(parseInt(chainId), safeAccount, sessionValidator, "validator")){

    calls.push(await buildInstallModule(parseInt(chainId), safeAccount, sessionValidator, "validator", "0x" ))

  }

  calls.push({
      to: sessionValidator,
      value: BigInt(0),
      data: (await sessionKeyValidator.enableSessionKey.populateTransaction(address, sessionKeyData)).data as Hex
  })
  return calls;
}

export const buildDCAJob = async (chainId: string,  safeAccount: Address, amount: string, validAfter: number, validUntil: number, refreshInterval: number, fromToken: string, targetToken: string, vault: string): Promise<Transaction[]> => {

    
  const provider = await getJsonRpcProvider(chainId);

  console.log(await getTokenDecimals(fromToken, provider))

  const parsedAmount = parseUnits(amount, await  getTokenDecimals(fromToken, provider))

  // NOTE: ValidAfter is 0 because of forked time issue
  const sessionData = { vault: vault, token: fromToken, targetToken: targetToken,  account: safeAccount, validAfter: 0, validUntil: validUntil, limitAmount: parsedAmount, refreshInterval: refreshInterval }

  const autoDCA = new Contract(
      autoDCAExecutor,
      AutoDCAExecutor.abi,
      provider
  )

  const calls: Transaction[] = []
  if(!await isInstalled(parseInt(chainId), safeAccount, autoDCAExecutor, "executor")){

    console.log("Installing new autoDCAExecutor")
    
    calls.push(await buildInstallModule(parseInt(chainId), safeAccount, autoDCAExecutor, "executor", "0x" ))

  }

  calls.push({
      to: autoDCAExecutor,
      value: BigInt(0),
      data: (await autoDCA.createJob.populateTransaction(sessionData)).data as Hex
  })

  return calls;
}

export const buildSmartSessionModule = async (chainId: string,  safeAccount: Address): Promise<Transaction[]> => {

    
  const calls: Transaction[] = []
  if(!await isInstalled(parseInt(chainId), safeAccount, smartSession, "validator")){
    
    calls.push(await buildInstallModule(parseInt(chainId), safeAccount, smartSession, "validator", "0x" ))

  }
  return calls;
}


export const buildScheduleData = async (chainId: string,  jobId: number): Promise<Transaction> => {

    

  const execCallData = new Interface(AutoDCAExecutor.abi).encodeFunctionData('executeJob', [jobId])



  return {
      to: autoDCAExecutor,
      value: BigInt(0),
      data: execCallData as Hex
  }
}



export const buildEnableAndUseSmartSession = async (chainId: string,  safeAccount: Address, walletProvider: any): Promise<Transaction> => {

  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function transferFrom(address from, address to, uint256 value) returns (bool)"
  ];

    
        const sessionPk = "0xdd1db445a79e51f16d08c4e5dc5810c4b5f29882b8610058cfecd425ac293712"
        const sessionOwner = privateKeyToAccount(sessionPk)

        const provider = await getJsonRpcProvider(chainId);

      
        const parsedAmount = parseUnits("5", await  getTokenDecimals("0xc2132D05D31c914a87C6611C10748AEb04B58e8F", provider))

        const execCallData = new Interface(ERC20_ABI).encodeFunctionData('transfer', ["0x958543756A4c7AC6fB361f0efBfeCD98E4D297Db", parsedAmount] )


        const session: Session = {
          sessionValidator: OWNABLE_VALIDATOR_ADDRESS,
          sessionValidatorInitData: encodeValidationData({
            threshold: 1,
            owners: [sessionOwner.address],
          }),
          salt: toHex(toBytes('0', { size: 32 })),
          userOpPolicies: [],
          erc7739Policies: {
            allowedERC7739Content: [],
            erc1271Policies: [],
          },
          actions: [
            {
              actionTarget: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as Address, // an address as the target of the session execution
              actionTargetSelector: execCallData.slice(0, 10) as Hex, // function selector to be used in the execution, in this case no function selector is used
              actionPolicies: [{
                policy: "0xb876b760660cF2Ca7C6e1c5D31806109aD9ce924",
                // address: "0x2dE7C748E9236898401eA41e6fC9C45F181CA7B3",
                initData: '0x',
              }],
            },
          ],
          chainId: BigInt(chainId),
        }

        const account = getAccount({
          address: safeAccount,
          type: 'safe',
        })
         
        const client = getClient({ rpcUrl: NetworkUtil.getNetworkById(parseInt(chainId))?.url!});

         
        const sessionDetails = await getEnableSessionDetails({
          sessions: [session],
          account,
          client: client,
        })

        // const webAuthnAccount = await toWebAuthnAccount(parseInt(chainId), walletProvider);
        // const passkeySig =  await webAuthnAccount.signMessage({
        //   message: { raw: sessionDetails.permissionEnableHash },
        // })

        // console.log(encodePacked(['address', 'bytes'], [ webAuthnModule, passkeySig]))
        
        // sessionDetails.enableSessionData.enableSession.permissionEnableSig = webAuthnModule + passkeySig.slice(2) as Hex;

        // console.log(sessionDetails)

        // const call = {to: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as Address, value: BigInt(0), data: execCallData as Hex}

        // await sendTransaction(chainId, [call], sessionOwner, safeAccount, "sessionkey", sessionDetails)


  return {
      to: '0x',
      value: BigInt(0),
      data: '0x' as Hex
  }
}


export const buildUseSmartSession = async (chainId: string, validator: {address: Address, initData: Hex}): Promise<{
  mode: SmartSessionModeType
  permissionId: Hex
  enableSessionData?: EnableSessionData
}> => {
 

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

        const sessionDetails = { permissionId: getPermissionId({session}), mode: SmartSessionMode.USE }

        return sessionDetails;
}



export const buildEnableSmartSession = async (chainId: string,  tokenLimits: {token: Address, amount: string}[], validator: {address: Address, initData: Hex}): Promise<Transaction> => {

    
        const provider = await getJsonRpcProvider(chainId);
        const execCallSelector = toFunctionSelector({
          name: 'transfer',
          type: 'function',
          inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
          outputs: [],
          stateMutability: 'view',
        })


        const actions: ActionData[] = await Promise.all(tokenLimits.map(async ({ token, amount }) => {
        const parsedAmount = parseUnits(amount, await getTokenDecimals(token, provider));
        const spendingLimitsPolicy = getSpendingLimitsPolicy([
            {
                token: token,
                limit: parsedAmount,
            },
        ]);

        return {
            actionTarget: token, // an address as the target of the session execution
            actionTargetSelector: execCallSelector, // function selector to be used in the execution
            actionPolicies: [{
                policy: spendLimitPolicy,
                initData: spendingLimitsPolicy.initData,
            }],
        };
    }));


        const session: Session = {
          sessionValidator: validator.address,
          sessionValidatorInitData: validator.initData,
          salt: toHex(toBytes('1', { size: 32 })),
          userOpPolicies: [],
          erc7739Policies: {
            allowedERC7739Content: [],
            erc1271Policies: [],
          },
          actions,
          chainId: BigInt(chainId),
        }

        console.log(await buildUseSmartSession(chainId, {address: validator.address, initData: validator.initData}))

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
