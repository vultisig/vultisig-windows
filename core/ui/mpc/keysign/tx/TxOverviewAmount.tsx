import { Coin } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
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
  contractAddress?: string
}

export const TxOverviewAmount = ({
  amount,
  value,
  actionLabel,
  contractAddress,
}: TxOverviewAmountProps) => {
  const priceQuery = useCoinPriceQuery({ coin: value })
  const formatFiatAmount = useFormatFiatAmount()
  const { t } = useTranslation()

  const isActionDisplay = !!actionLabel
  const showAmountWithAction = actionLabel && amount > 0

  const mainLabel = actionLabel ? (t(actionLabel) as string) : t('sent')
  const mainContent = showAmountWithAction
    ? `${mainLabel} ${amount} ${value.ticker}`
    : actionLabel
      ? mainLabel
      : `${amount} ${value.ticker}`

  return (
    <Panel>
      <VStack alignItems="center" gap={12}>
        <Text size={10} color="supporting">
          {isActionDisplay ? t('action') : t('sent')}
        </Text>
        {value && <CoinIcon coin={value} style={{ fontSize: 32 }} />}
        <Text size={18}>{mainContent}</Text>
        {contractAddress && (
          <Text color="supporting" size={12}>
            <MiddleTruncate text={contractAddress} width={140} />
          </Text>
        )}
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
