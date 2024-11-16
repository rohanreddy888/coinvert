import { Hex, createPublicClient, http, Chain, Transport, Address, defineChain } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { base, polygon, baseSepolia, sepolia } from 'viem/chains'
import { entryPoint07Address } from "viem/account-abstraction"


export const polygonsandbox = /*#__PURE__*/ defineChain({
  id: 11235,
  name: 'Polygon',
  nativeCurrency: { name: 'Polygon', symbol: 'POLY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.dev.buildbear.io/embarrassing-groot-85ac687a'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polygon',
      url: 'https://polygonscan.com/',
      apiUrl: 'https://api.polygonscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 7654707,
    },
  },
})

import {
  createSmartAccountClient,
  SmartAccountClient
} from 'permissionless'
import {
   toNexusSmartAccount,
   toSafeSmartAccount
} from 'permissionless/accounts'
import { erc7579Actions, Erc7579Actions } from 'permissionless/actions/erc7579'
import {
  createPimlicoClient
} from 'permissionless/clients/pimlico'
// import { EntryPoint, UserOperation } from 'permissionless/types'
import { publicClient } from './utils'
import { Erc7739ActionsParameters } from 'viem/experimental'
import { NetworkUtil } from './networks'

// export type SafeSmartAccountClient = SmartAccountClient<
//   EntryPoint,
//   Transport,
//   Chain> &
//   Erc7579Actions<EntryPoint, Transport, Chain, SafeSmartAccount<EntryPoint, Transport, Chain>>

  export const getChain = (chainId: string) : Chain => {
    return [base, polygon, polygonsandbox, sepolia, baseSepolia].find((chain: any) => chain.id == chainId) as Chain;
  }
  


const getPimlicoEndpoint = (chainId: string) => {

  return NetworkUtil.getNetworkById(parseInt(chainId))?.bundler
}


export const getPimlicoClient = (chainId: string) => {

return createPimlicoClient({
	transport: http(getPimlicoEndpoint(chainId)),
	entryPoint: {
		address: entryPoint07Address,
		version: "0.7",
	},
})
}
 

interface SmartAccountClientParams {
  chainId: string;
  signer?: any;
  nonceKey?: bigint;
  address?: Hex;
  signUserOperation?: any;
  getDummySignature? : any;
  validatorAddress? : Address;
  factoryAddress? : Address;
}



export const getSmartAccountClient = async ( { chainId, nonceKey, signer, address, signUserOperation, getDummySignature, validatorAddress, factoryAddress  } : SmartAccountClientParams ) => {

  const chain = getChain(chainId)

  console.log(chain)

    // account.signUserOperation = signUserOperation ?? account.signUserOperation
  // account.getDummySignature = getDummySignature ?? account.getDummySignature


  const client = publicClient(parseInt(chainId))
  client.chain = getChain(chainId)
  // const nexusAccount = await toNexusSmartAccount({
  //   client: client,
  //   owners: [signer],
  //   version: "1.0.0",
  //   index: BigInt(0), // optional
  //   factoryAddress,
  //   validatorAddress,
  //   address: address, // optional, only if you are using an already created account,
  // })

  const safeAccount = await toSafeSmartAccount({
    client: client,
    owners: [signer],
    version: "1.4.1",
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    safe4337ModuleAddress: "0x19e52168B2e0A39a53dcB4cFDEA5850e496F873a",
    erc7579LaunchpadAddress: "0x2E1a6a9802Eb62ec52E862a6373F1E52A4F3f395",
    attesters: ["0x000000333034E9f539ce08819E12c1b8Cb29084d"], // This address belongs to Rhinestone. By designating them as attesters, you authorize that only modules explicitly approved by Rhinestone can be installed on your safe.
    attestersThreshold: 0,
  })


  // nexusAccount.getNonce()

  const pimlicoClient = getPimlicoClient(chainId)
  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    chain: chain,
    bundlerTransport: http(getPimlicoEndpoint(chainId)),
    // paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => (await pimlicoClient.getUserOperationGasPrice()).fast,
    },
  }).extend(erc7579Actions())

  // const pimlicoBundlerClient = await getBundlerClient(chainId)
  // const paymasterClient = await getPaymasterClient(chainId)

    // const smartAccountClient = createSmartAccountClient({
  //   account,
  //   entryPoint: ENTRYPOINT_ADDRESS_V07,
  //   bundlerTransport: http(getPimlicoEndpoint(chainId)),
  //   middleware: {
  //     gasPrice: async () =>
  //       (await pimlicoBundlerClient.getUserOperationGasPrice()).fast,
  //     ...(NetworkUtil.getNetworkById(parseInt(chainId))?.type !== "fork" ? { sponsorUserOperation: paymasterClient.sponsorUserOperation } : {})
  //   }
  // }).extend(erc7579Actions({ entryPoint: ENTRYPOINT_ADDRESS_V07 })) 

  return smartAccountClient;
}


export const waitForExecution = async (chainId: string, userOperationHash: string) => {


  const pimlicoBundlerClient = await getPimlicoClient(chainId)
  const receipt = await pimlicoBundlerClient.waitForUserOperationReceipt({ hash: userOperationHash as Hex, timeout: 60000})

  return receipt;

}

