import { Coin } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'

export const TxOverviewAmount = ({
  amount,
  value,
}: ValueProp<Coin> & {
  amount: number
}) => {
  const priceQuery = useCoinPriceQuery({ coin: value })
  const fiatCurrency = useFiatCurrency()
  const { t } = useTranslation()

  return (
    <Panel>
      <VStack alignItems="center" gap={12}>
        <Text size={10} color="supporting">
          {t('sent')}
        </Text>
        {value && <CoinIcon coin={value} style={{ fontSize: 32 }} />}
        <Text size={18}>{`${amount} ${value.ticker}`}</Text>
        <MatchQuery
          value={priceQuery}
          success={price => (
            <Text color="supporting" size={13}>
              {formatAmount(amount * price, fiatCurrency)}
            </Text>
          )}
        />
      </VStack>
    </Panel>
  )
}
