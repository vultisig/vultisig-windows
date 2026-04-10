import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'

import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'

type TxActionLabelKey =
  | 'left_pool'
  | 'contract_execution'
  | 'deposited'
  | 'transferred'

type TxOverviewAmountProps = ValueProp<Coin> & {
  amount: number
  actionLabel?: TxActionLabelKey
  resolvedLabel?: string
}

export const TxOverviewAmount = ({
  amount,
  value,
  actionLabel,
  resolvedLabel,
}: TxOverviewAmountProps) => {
  const priceQuery = useCoinPriceQuery({ coin: value })
  const formatFiatAmount = useFormatFiatAmount()
  const { t } = useTranslation()

  const topLabel = resolvedLabel
    ? resolvedLabel
    : actionLabel
      ? (t(actionLabel) as string)
      : t('sent')

  const amountContent = `${amount} ${value.ticker}`

  return (
    <Panel>
      <VStack alignItems="center" gap={12}>
        <Text size={10} color="supporting">
          {topLabel}
        </Text>
        {value && <CoinIcon coin={value} style={{ fontSize: 32 }} />}
        <Text size={18}>{amountContent}</Text>
        {amount > 0 && (
          <MatchQuery
            value={priceQuery}
            success={price => (
              <Text color="supporting" size={13}>
                {formatFiatAmount(amount * price)}
              </Text>
            )}
          />
        )}
      </VStack>
    </Panel>
  )
}
