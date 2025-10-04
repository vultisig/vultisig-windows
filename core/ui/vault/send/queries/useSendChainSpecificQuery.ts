import { getChainKind } from '@core/chain/ChainKind'
import { feePriorities } from '@core/chain/tx/fee/FeePriority'
import { byteFeeMultiplier } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import { UTXOSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { match } from '@lib/utils/match'
import { useMemo } from 'react'

import { useChainSpecificQuery } from '../../../chain/coin/queries/useChainSpecificQuery'
import {
  FeeSettings,
  feeSettingsChainKinds,
  useFeeSettings,
} from '../fee/settings/state/feeSettings'
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
          const { priority } = feeSettings as FeeSettings<'utxo'>
          ;(
            result as ChainSpecificResolverInput<UTXOSpecific>
          ).byteFeeMultiplier = isOneOf(priority, feePriorities)
            ? byteFeeMultiplier[priority]
            : priority
        },
      })
    }

    return result
  }, [amount, coin, feeSettings, memo, receiver])

  return useChainSpecificQuery(input)
}
