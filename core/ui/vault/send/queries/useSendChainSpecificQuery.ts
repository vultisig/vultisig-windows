import { getChainKind } from '@core/chain/ChainKind'
import {
  FeeSettings,
  feeSettingsChainKinds,
} from '@core/chain/feeQuote/settings/core'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { match } from '@lib/utils/match'
import { useMemo } from 'react'

import { useChainSpecificQuery } from '../../../chain/coin/queries/useChainSpecificQuery'
import { useFeeSettings } from '../fee/settings/state/feeSettings'
import { useSendAmount } from '../state/amount'
import { useSendMemo } from '../state/memo'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendChainSpecificQuery = () => {
  const coin = useCurrentSendCoin()
  const [feeSettings] = useFeeSettings()
  const [receiver] = useSendReceiver()
  const [amount] = useSendAmount()
  const [memo] = useSendMemo()

  const input: ChainSpecificResolverInput = useMemo(() => {
    const result: ChainSpecificResolverInput = {
      coin,
      receiver,
      amount: amount ?? 0n,
      data: memo,
    }

    if (feeSettings) {
      const chainKind = getChainKind(coin.chain)
      if (!isOneOf(chainKind, feeSettingsChainKinds)) {
        return result
      }

      match(chainKind, {
        evm: () => {
          result.feeQuote = feeSettings as FeeSettings<'evm'>
        },
        utxo: () => {
          // Reminder: do not apply UTXO fee settings to chain-specific input yet.
          // We'll wire byteFee/priority in a follow-up change.
        },
        tron: () => {
          result.feeQuote = feeSettings as FeeSettings<'tron'>
        },
      })
    }

    return result
  }, [amount, coin, feeSettings, memo, receiver])

  return useChainSpecificQuery(input)
}
