import { isChainOfKind } from '@core/chain/ChainKind'
import { FeeQuoteResolverInput } from '@core/chain/feeQuote/resolver'

import { getTxAmount } from './amount'
import { ParsedTx } from './parsedTx'
import { getTxReceiver } from './receiver'

export const getFeeQuoteInput = (parsedTx: ParsedTx): FeeQuoteResolverInput => {
  const { coin, thirdPartyGasLimitEstimation, customTxData } = parsedTx

  const amount = getTxAmount(parsedTx)
  const receiver = getTxReceiver(customTxData)

  return {
    amount,
    receiver,
    coin,
    isComplexTx: isChainOfKind(coin.chain, 'utxo') ? true : undefined,
    thirdPartyGasLimitEstimation,
    data:
      'regular' in customTxData
        ? customTxData.regular.transactionDetails.data
        : undefined,
  }
}
