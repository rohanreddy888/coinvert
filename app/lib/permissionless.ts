import { Hex, createPublicClient, http, Chain, Transport, Address, defineChain } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { base, polygon, baseSepolia, sepolia } from 'viem/chains'
import { entryPoint07Address } from "viem/account-abstraction"


export const arbitrum = /*#__PURE__*/ defineChain({
  id: 42_161,
  name: 'Arbitrum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://arb1.arbitrum.io/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://arbiscan.io',
      apiUrl: 'https://api.arbiscan.io/api',
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
   toNexusSmartAccount
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
    return [base, polygon, arbitrum, sepolia, baseSepolia].find((chain: any) => chain.id == chainId) as Chain;
  }
  

// const safe4337ModuleAddress = '0x19e52168B2e0A39a53dcB4cFDEA5850e496F873a'
// const erc7579LaunchpadAddress = '0x2E1a6a9802Eb62ec52E862a6373F1E52A4F3f395'



const getPimlicoEndpoint = (chainId: string) => {

  return NetworkUtil.getNetworkById(parseInt(chainId))?.bundler
}

// export const getPaymasterClient = async (chainId: string) => {
// return createPimlicoPaymasterClient({
//   transport: http(getPimlicoEndpoint(chainId)),
//   entryPoint: ENTRYPOINT_ADDRESS_V07
// })
// }

// export const getBundlerClient = async (chainId: string) => {
//  return createPimlicoBundlerClient({
//   transport: http(getPimlicoEndpoint(chainId)),
//   entryPoint: ENTRYPOINT_ADDRESS_V07
// })

// }
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
  
  // Setting the init Safe Owner to safe4337ModuleAddress (Safe7579 adapter) address which is a contract and can't execute on Safe
  // dummySigner.address = safe4337ModuleAddress as Hex

  // const account = await signerToSafeSmartAccount(publicClient(parseInt(chainId)), {
  //   entryPoint: ENTRYPOINT_ADDRESS_V07,
  //   signer: dummySigner,
  //   address,
  //   nonceKey,
  //   safeVersion: '1.4.1',
  //   saltNonce: BigInt(120),
  //   safe4337ModuleAddress,
  //   erc7579LaunchpadAddress,
  //   validators: validators?.length ? validators : [],
  //   executors: executors?.length ? executors : [],
  // })

    // account.signUserOperation = signUserOperation ?? account.signUserOperation
  // account.getDummySignature = getDummySignature ?? account.getDummySignature


const owner = privateKeyToAccount("0x47cfffe655129fa5bce61a8421eb6ea97ec6d5609b5fbea45ad68bacede19d8b")

  const client = publicClient(parseInt(chainId))
  client.chain = getChain(chainId)
  const nexusAccount = await toNexusSmartAccount({
    client: client,
    owners: [signer],
    version: "1.0.0",
    index: BigInt(0), // optional
    factoryAddress,
    validatorAddress,
    // address: "0x...", // optional, only if you are using an already created account
  })

  console.log(await nexusAccount.getNonce())

  const pimlicoClient = getPimlicoClient(chainId)
  const smartAccountClient = createSmartAccountClient({
    account: nexusAccount,
    chain: chain,
    bundlerTransport: http(getPimlicoEndpoint(chainId)),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => (await pimlicoClient.getUserOperationGasPrice()).fast,
    },
  })

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
