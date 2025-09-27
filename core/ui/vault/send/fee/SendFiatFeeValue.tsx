import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'

import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useKeysignUtxoInfo } from '../../../mpc/keysign/utxo/queries/keysignUtxoInfo'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendFiatFeeValue = () => {
  const coin = useCurrentSendCoin()
  const chainSpecific = useSendChainSpecific()
  const { data: utxoInfo } = useKeysignUtxoInfo({
    chain: coin.chain,
    address: coin.address,
  })
  const [sendAmount] = useSendAmount()
  const fee = getFeeAmount({
    chainSpecific,
    utxoInfo,
    amount: sendAmount,
    chain: coin.chain,
  })

  const formatFiatAmount = useFormatFiatAmount()
  const feeCoin = chainFeeCoin[coin.chain]
  const feeCoinPriceQuery = useCoinPriceQuery({
    coin: feeCoin,
  })

  const { decimals, ticker } = feeCoin

  const humanReadableFeeValue = fromChainAmount(fee, decimals)

  return (
    <MatchQuery
      value={feeCoinPriceQuery}
      pending={() => (
        <VStack>
          <Skeleton width="88" height="12" />
          <Skeleton width="48" height="12" />
        </VStack>
      )}
      success={price => (
        <VStack alignItems="flex-end">
          <Text size={14}>
            {formatAmount(humanReadableFeeValue, { ticker })}
          </Text>
          <Text size={14} color="shy">
            {formatFiatAmount(humanReadableFeeValue * price)}
          </Text>
        </VStack>
      )}
    />
  )
}
