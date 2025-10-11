import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { applyFeeSettings } from '@core/chain/feeQuote/applyFeeSettings'
import { FeeQuote } from '@core/chain/feeQuote/core'
import {
  FeeSettingsChainKind,
  feeSettingsChainKinds,
} from '@core/chain/feeQuote/settings/core'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'

import { useFeeQuoteQuery } from '../../../chain/fee-quote/query'
import { useFeeSettings } from '../fee/settings/state/feeSettings'
import { useSendAmount } from '../state/amount'
import { useSendMemo } from '../state/memo'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendFeeQuoteQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [amount] = useSendAmount()
  const [memo] = useSendMemo()

  return useFeeQuoteQuery({
    coin,
    receiver,
    amount: shouldBePresent(amount),
    data: memo,
  })
}

export const useSendFeeQuote = <T extends ChainKind = ChainKind>() => {
  const { chain } = useCurrentSendCoin()
  const { data } = useSendFeeQuoteQuery()
  const [settings] = useFeeSettings()

  return useMemo(() => {
    const quote = shouldBePresent(
      data,
      'send fee quote query data'
    ) as FeeQuote<T>

    if (!settings) return quote

    const chainKind = getChainKind(chain)
    if (isOneOf(chainKind, feeSettingsChainKinds)) {
      return applyFeeSettings({
        chainKind,
        quote: quote as FeeQuote<FeeSettingsChainKind>,
        settings,
      }) as FeeQuote<T>
    }

    return quote
  }, [chain, data, settings])
}
