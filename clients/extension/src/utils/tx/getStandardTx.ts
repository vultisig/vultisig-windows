import api from '@clients/extension/src/utils/api'
import {
  ChainProps,
  TransactionDetails,
  TransactionType,
} from '@clients/extension/src/utils/interfaces'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

const transactionHandlers = {
  Keplr: (
    tx: TransactionType.Keplr,
    chain: ChainProps
  ): TransactionDetails => ({
    asset: {
      chain: chain.chain,
      ticker: tx.amount[0].denom,
    },
    amount: { amount: tx.amount[0].amount, decimals: chain.decimals },
    from: tx.from_address,
    to: tx.to_address,
  }),

  Phantom: async (
    tx: TransactionType.Phantom,
    chain: ChainProps
  ): Promise<TransactionDetails> => {
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
        throw Error(`Could not fetch solana token info: ${err}`)
      }
    }
  },

  MetaMask: (
    tx: TransactionType.MetaMask,
    chain: ChainProps
  ): TransactionDetails => ({
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
  }),

  Ctrl: (tx: TransactionType.Ctrl): TransactionDetails => ({
    asset: tx.asset,
    data: tx.memo,
    from: tx.from,
    gasLimit: tx.gasLimit,
    to: tx.recipient,
    amount: tx.amount,
  }),

  Vultisig: (tx: TransactionType.Vultisig): TransactionDetails => ({
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

  switch (tx.txType) {
    case 'Keplr':
      return transactionHandlers.Keplr(tx, chain)
    case 'Phantom':
      return await transactionHandlers.Phantom(tx, chain)
    case 'MetaMask':
      return transactionHandlers.MetaMask(tx, chain)
    case 'Ctrl':
      return transactionHandlers.Ctrl(tx)
    case 'Vultisig':
      return transactionHandlers.Vultisig(tx)
    default:
      throw new Error(`Unsupported transaction type`)
  }
}
