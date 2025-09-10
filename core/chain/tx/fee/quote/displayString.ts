import { formatAmount } from '@lib/utils/formatAmount'

import { fromChainAmount } from '../../../amount/fromChainAmount'
import { ChainKind, ChainOfKind, isChainOfKind } from '../../../ChainKind'
import { chainFeeCoin } from '../../../coin/chainFeeCoin'
import { gwei } from '../evm/gwei'
import { utxoAverageTxSize } from '../utxo/config'
import { FeeQuote } from './core'

type Input<T extends ChainKind = ChainKind> = {
  chain: ChainOfKind<T>
  feeQuote: FeeQuote<T>
}

export const getFeeQuoteDisplayString = <T extends ChainKind = ChainKind>({
  chain,
  feeQuote,
}: Input<T>) => {
  const feeCoin = chainFeeCoin[chain]

  const getUnit = () => {
    if (isChainOfKind(chain, 'utxo')) {
      return `${feeCoin.ticker}/vbyte`
    }

    if (isChainOfKind(chain, 'evm')) {
      return gwei.name
    }

    return feeCoin.ticker
  }

  const getDecimals = () => {
    if (isChainOfKind(chain, 'evm')) {
      return gwei.decimals
    }

    return feeCoin.decimals
  }

  const getAmount = () => {
    if (typeof feeQuote === 'bigint') {
      if (isChainOfKind(chain, 'utxo')) {
        return feeQuote * utxoAverageTxSize
      }
      return feeQuote
    }

    return feeQuote.gasLimit * feeQuote.maxPriorityFeePerGas
  }

  return formatAmount(fromChainAmount(getAmount(), getDecimals()), getUnit())
}
