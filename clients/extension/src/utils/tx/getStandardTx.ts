import {
  ChainProps,
  TransactionDetails,
  TransactionType,
} from '@clients/extension/src/utils/interfaces'

const transactionHandlers = {
  Keplr: (
    tx: TransactionType.Keplr,
    chain: ChainProps
  ): TransactionDetails => ({
    asset: {
      chain: chain.ticker,
      ticker: tx.amount[0].denom,
    },
    amount: { amount: tx.amount[0].amount, decimals: chain.decimals },
    from: tx.from_address,
    to: tx.to_address,
  }),

  Phantom: (
    tx: TransactionType.Phantom,
    chain: ChainProps
  ): TransactionDetails => ({
    asset: {
      chain: chain.ticker,
      ticker: chain.ticker,
    },
    amount: { amount: tx.value, decimals: chain.decimals },
    from: tx.from,
    to: tx.to,
  }),

  MetaMask: (
    tx: TransactionType.MetaMask,
    chain: ChainProps
  ): TransactionDetails => ({
    from: tx.from,
    to: tx.to,
    asset: {
      chain: chain.ticker,
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
      return transactionHandlers.Phantom(tx, chain)
    case 'MetaMask':
      return transactionHandlers.MetaMask(tx, chain)
    case 'Ctrl':
      return transactionHandlers.Ctrl(tx)
    default:
      throw new Error(`Unsupported transaction type`)
  }
}
