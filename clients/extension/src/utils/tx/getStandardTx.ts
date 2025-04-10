import api from '@clients/extension/src/utils/api'
import {
  ChainProps,
  TransactionDetails,
  TransactionType,
} from '@clients/extension/src/utils/interfaces'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

type TransactionHandlers = {
  [K in TransactionType.WalletTransaction['txType']]: (
    tx: Extract<TransactionType.WalletTransaction, { txType: K }>,
    chain: ChainProps
  ) => Promise<TransactionDetails> | TransactionDetails
}

const transactionHandlers: TransactionHandlers = {
  Keplr: (tx, chain) => ({
    asset: {
      chain: chain.chain,
      ticker: tx.amount[0].denom,
    },
    amount: { amount: tx.amount[0].amount, decimals: chain.decimals },
    from: tx.from_address,
    to: tx.to_address,
  }),

  Phantom: async (tx, chain) => {
    if (tx.asset.ticker && tx.asset.ticker === chainFeeCoin.Solana.ticker) {
      return {
        asset: {
          chain: chain.chain,
          ticker: tx.asset.ticker,
        },
        amount: { amount: tx.amount, decimals: chain.decimals },
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
            chain: chain.chain,
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
      chain: chain.chain,
      ticker: chain.ticker,
    },
    amount: tx.value
      ? { amount: tx.value, decimals: chain.decimals }
      : undefined,
    data: tx.data,
    gasSettings: {
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      gasLimit: tx.gas,
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
  chain: ChainProps
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
