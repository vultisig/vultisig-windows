import api from '@clients/extension/src/utils/api'
import {
  TransactionDetails,
  TransactionType,
} from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { match } from '@lib/utils/match'
import { ethers } from 'ethers'

import { CosmosMsgType } from '../constants'

type TransactionHandlers = {
  [K in TransactionType.WalletTransaction['txType']]: (
    tx: Extract<TransactionType.WalletTransaction, { txType: K }>,
    chain: Chain
  ) => Promise<TransactionDetails> | TransactionDetails
}

const transactionHandlers: TransactionHandlers = {
  Keplr: (tx, chain) => {
    const [message] = tx.msgs
    return match(message.type, {
      [CosmosMsgType.MSG_SEND]: () => {
        return {
          asset: {
            chain: chain,
            ticker: message.value!.amount[0].denom,
          },
          amount: {
            amount: message.value.amount[0].amount,
            decimals: chainFeeCoin[chain].decimals,
          },
          from: message.value.from_address,
          to: message.value.to_address,
        }
      },
      [CosmosMsgType.MSG_EXECUTE_CONTRACT]: () => {
        return {
          asset: {
            chain: chain,
            ticker: message.value!.funds[0].denom,
          },
          amount: {
            amount: message.value.funds[0].amount,
            decimals: chainFeeCoin[chain].decimals,
          },
          from: message.value.sender,
          to: message.value.contract,
          memo: `${CosmosMsgType.MSG_EXECUTE_CONTRACT}-${message.value.msg}`,
        }
      },
    })
  },

  Phantom: async (tx, chain) => {
    if (tx.asset.ticker && tx.asset.ticker === chainFeeCoin.Solana.ticker) {
      return {
        asset: {
          chain: chain,
          ticker: tx.asset.ticker,
        },
        amount: { amount: tx.amount, decimals: chainFeeCoin[chain].decimals },
        from: tx.from,
        to: tx.to,
      }
    } else {
      if (!tx.asset.mint) {
        throw new Error('No mint address provided')
      }
      try {
        const token = await api.solana.fetchSolanaTokenInfo(tx.asset.mint)

        return {
          asset: {
            chain: chain,
            ticker: token.symbol,
            symbol: token.name,
            mint: tx.asset.mint,
          },
          amount: { amount: tx.amount, decimals: token.decimals },
          from: tx.from,
          to: tx.to,
        }
      } catch (err) {
        throw new Error(`Could not fetch Solana token info: ${err}`)
      }
    }
  },

  MetaMask: (tx, chain) => ({
    from: tx.from,
    to: tx.to,
    asset: {
      chain: chain,
      ticker: chainFeeCoin[chain].ticker,
    },
    amount: tx.value
      ? { amount: tx.value, decimals: chainFeeCoin[chain].decimals }
      : undefined,
    data: tx.data,
    gasSettings: {
      maxFeePerGas: ethers.isHexString(tx.maxFeePerGas)
        ? ethers.toBigInt(tx.maxFeePerGas).toString()
        : tx.maxFeePerGas,
      maxPriorityFeePerGas: ethers.isHexString(tx.maxPriorityFeePerGas)
        ? ethers.toBigInt(tx.maxPriorityFeePerGas).toString()
        : tx.maxPriorityFeePerGas,
      gasLimit: ethers.isHexString(tx.gas)
        ? ethers.toBigInt(tx.gas).toString()
        : tx.gas,
    },
  }),

  Ctrl: tx => ({
    asset: tx.asset,
    data: tx.memo,
    from: tx.from,
    gasLimit: tx.gasLimit,
    to: tx.recipient,
    amount: tx.amount,
  }),

  Vultisig: tx => ({
    ...tx,
  }),
}

export const getStandardTransactionDetails = async (
  tx: TransactionType.WalletTransaction,
  chain: Chain
): Promise<TransactionDetails> => {
  if (!tx || !tx.txType) {
    throw new Error('Invalid transaction object or missing txType')
  }

  const handler = transactionHandlers[tx.txType]
  if (!handler) {
    throw new Error(`Unsupported transaction type: ${tx.txType}`)
  }

  return handler(tx as any, chain) // TypeScript ensures correctness due to TransactionHandlers type
}

export const isBasicTransaction = (
  transaction: Record<string, any> | null
): boolean => {
  return (
    typeof transaction === 'object' &&
    transaction !== null &&
    'from' in transaction &&
    'to' in transaction &&
    'value' in transaction
  )
}
