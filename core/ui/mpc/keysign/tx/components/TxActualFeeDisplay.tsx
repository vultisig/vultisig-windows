import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { TxReceiptInfo } from '@core/chain/tx/status'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'

import { useCoinPriceQuery } from '../../../../chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '../../../../chain/hooks/useFormatFiatAmount'

type TxActualFeeDisplayProps = {
  chain: Chain
  receipt: TxReceiptInfo
}

export const TxActualFeeDisplay = ({
  chain,
  receipt,
}: TxActualFeeDisplayProps) => {
  const formatFiatAmount = useFormatFiatAmount()
  const feeCoin = chainFeeCoin[chain]
  const feeCoinPriceQuery = useCoinPriceQuery({ coin: feeCoin })
  const fee = fromChainAmount(receipt.feeAmount, receipt.feeDecimals)

  return (
    <VStack alignItems="flex-end" gap={4}>
      <Text size={14}>{formatAmount(fee, { ticker: receipt.feeTicker })}</Text>
      <Text size={12} color="shy">
        <MatchQuery
          value={feeCoinPriceQuery}
          pending={() => <Spinner />}
          success={price => formatFiatAmount(fee * price)}
        />
      </Text>
    </VStack>
  )
}
