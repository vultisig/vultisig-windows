import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { requestAccount } from '@clients/extension/src/inpage/providers/core/requestAccount'
import { EvmChain } from '@core/chain/Chain'
import {
  getEvmChainByChainId,
  getEvmChainId,
} from '@core/chain/chains/evm/chainInfo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { callBackground } from '@core/inpage-provider/background'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { callPopup } from '@core/inpage-provider/popup'
import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt, withFallback } from '@lib/utils/attempt'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { ethers, getBytes, isHexString, Signature } from 'ethers'
import { BlockTag, type RpcTransactionRequest } from 'viem'

export const processSignature = (signature: string) => {
  let result = Signature.from(ensureHexPrefix(signature))

  if (result.v < 27) {
    result = Signature.from({
      r: result.r,
      s: result.s,
      v: result.v + 27,
    })
  }

  return ensureHexPrefix(result.serialized)
}

const getChain = async () => {
  const chain = await callBackground({
    getAppChain: { chainKind: 'evm' },
  })
  return chain as EvmChain
}

const switchChainHandler = async ([{ chainId }]: [{ chainId: string }]) => {
  const chain = getEvmChainByChainId(chainId)
  if (!chain) {
    throw new EIP1193Error('UnrecognizedChain')
  }

  const { error } = await attempt(async () =>
    callBackground({ setAppChain: { evm: chain } })
  )
  if (error) {
    if (error === BackgroundError.Unauthorized) {
      await callBackground({ setVaultChain: { evm: chain } })
    } else {
      throw error
    }
  }

  return null
}

export const ethereumHandlers = {
  eth_chainId: async () =>
    callBackground({
      getAppChainId: { chainKind: 'evm' },
    }),
  eth_accounts: async () =>
    withFallback(
      attempt(async () => {
        const chain = await getChain()

        const { address } = await callBackground({
          getAccount: { chain },
        })

        return [address]
      }),
      []
    ),
  eth_requestAccounts: async (params?: [{ preselectFastVault?: boolean }]) => {
    const chain = await getChain()
    const preselectFastVault = params?.[0]?.preselectFastVault

    const { address } = await requestAccount(chain, { preselectFastVault })

    return [address]
  },
  wallet_switchEthereumChain: switchChainHandler,
  wallet_addEthereumChain: switchChainHandler,
  wallet_getPermissions: async () => [],
  wallet_requestPermissions: async () => [],
  wallet_revokePermissions: async () => {
    await callBackground({
      signOut: {},
    })
  },
  net_version: async () => {
    const chain = await getChain()

    return parseInt(getEvmChainId(chain), 16).toString()
  },
  eth_getCode: async ([address, at]: [
    `0x${string}`,
    BlockTag | `0x${string}` | undefined,
  ]) =>
    callBackground({
      evmClientRequest: {
        method: 'eth_getCode',
        params: [address, at ?? 'latest'],
      },
    }),
  eth_getTransactionCount: async ([address, at]: [
    `0x${string}`,
    BlockTag | `0x${string}` | undefined,
  ]) =>
    callBackground({
      evmClientRequest: {
        method: 'eth_getTransactionCount',
        params: [address, at ?? 'latest'],
      },
    }),
  eth_getBalance: async ([address, at]: [
    `0x${string}`,
    BlockTag | `0x${string}` | undefined,
  ]) =>
    callBackground({
      evmClientRequest: {
        method: 'eth_getBalance',
        params: [address, at ?? 'latest'],
      },
    }),
  eth_blockNumber: async () =>
    callBackground({
      evmClientRequest: { method: 'eth_blockNumber' },
    }),
  eth_getBlockByNumber: async (params: [BlockTag | `0x${string}`, boolean]) =>
    callBackground({
      evmClientRequest: {
        method: 'eth_getBlockByNumber',
        params,
      },
    }),
  eth_gasPrice: async () =>
    callBackground({
      evmClientRequest: { method: 'eth_gasPrice' },
    }),
  eth_maxPriorityFeePerGas: async () =>
    callBackground({
      evmClientRequest: { method: 'eth_maxPriorityFeePerGas' },
    }),
  eth_estimateGas: async (
    params: [RpcTransactionRequest, BlockTag | `0x${string}` | undefined]
  ) =>
    callBackground({
      evmClientRequest: { method: 'eth_estimateGas', params },
    }),
  eth_call: async (
    params: [RpcTransactionRequest, BlockTag | `0x${string}` | undefined]
  ) =>
    callBackground({
      evmClientRequest: { method: 'eth_call', params },
    }),
  eth_getTransactionReceipt: async (
    params: [`0x${string}`] | [`0x${string}`, ...unknown[]]
  ) =>
    callBackground({
      evmClientRequest: {
        method: 'eth_getTransactionReceipt',
        params,
      },
    }),
  eth_getTransactionByHash: async (params: [`0x${string}`]) =>
    callBackground({
      evmClientRequest: {
        method: 'eth_getTransactionByHash',
        params,
      },
    }),
  eth_signTypedData_v4: async ([account, input]: [
    string,
    string | Eip712V4Payload,
  ]) => {
    const chain = await getChain()

    const result = await callPopup(
      {
        signMessage: {
          eth_signTypedData_v4: {
            chain,
            message:
              typeof input === 'string'
                ? (JSON.parse(input) as Eip712V4Payload)
                : input,
          },
        },
      },
      {
        account,
      }
    )

    return processSignature(result)
  },
  personal_sign: async ([rawMessage, account]: [string, string]) => {
    const chain = await getChain()

    const messageBytes = isHexString(rawMessage)
      ? getBytes(rawMessage)
      : new TextEncoder().encode(rawMessage)

    const signature = await callPopup(
      {
        signMessage: {
          personal_sign: {
            bytesCount: messageBytes.length,
            chain,
            message: rawMessage,
            type: 'default',
          },
        },
      },
      { account }
    )

    return processSignature(signature)
  },
  eth_sendTransaction: async ([tx]: [RpcTransactionRequest]) => {
    const chain = await getChain()

    const from = shouldBePresent(tx.from, 'tx.from')

    const { decimals, ticker } = chainFeeCoin[chain]

    const { hash } = await callPopup(
      {
        sendTx: {
          keysign: {
            transactionDetails: {
              from,
              to: tx.to ?? undefined,
              asset: {
                ticker,
              },
              amount: tx.value
                ? {
                    amount: ethers.toBigInt(tx.value).toString(),
                    decimals,
                  }
                : undefined,
              data: tx.data,
              gasSettings: {
                maxFeePerGas: tx.maxFeePerGas
                  ? ethers.toBigInt(tx.maxFeePerGas).toString()
                  : undefined,
                maxPriorityFeePerGas: tx.maxPriorityFeePerGas
                  ? ethers.toBigInt(tx.maxPriorityFeePerGas).toString()
                  : undefined,
                gasLimit: tx.gas
                  ? ethers.toBigInt(tx.gas).toString()
                  : undefined,
              },
            },
            chain,
          },
        },
      },
      {
        account: from,
      }
    )

    return hash
  },
} as const
