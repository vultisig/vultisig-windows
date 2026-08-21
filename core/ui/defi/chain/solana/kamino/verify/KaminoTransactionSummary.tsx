import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import {
  kaminoDecodedAmountString,
  KaminoDecodedTransaction,
  withdrawsEntireKaminoPosition,
} from '@vultisig/core-chain/chains/solana/kamino/tx/decode'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'

import { kaminoUnderlyingCoin } from '../underlyingCoin'

/**
 * What a Kamino transaction does, as read back out of the bytes that will be
 * signed.
 *
 * Every figure here comes from the decoder, not from the flow that built the
 * transaction — which is the point: on a co-signing device there is no such
 * flow, and on the initiating one an independent reading is what makes the
 * screen a check rather than an echo.
 *
 * A withdrawal names its SHARE count rather than a token amount. Shares are
 * what the instruction carries; what they are worth is decided by the vault at
 * settlement, and quoting a token figure here would state a number the bytes
 * do not contain.
 */
export const KaminoTransactionSummary = ({
  decoded,
}: {
  decoded: KaminoDecodedTransaction
}) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()

  const coin = kaminoUnderlyingCoin(decoded.descriptor)
  const pricesQuery = useCoinPricesQuery({ coins: [coin] })
  const priceUsd =
    pricesQuery.data?.[coinKeyToString({ chain: coin.chain, id: coin.id })] ?? 0

  const amount = kaminoDecodedAmountString(decoded)
  const isDeposit = decoded.operation === 'deposit'
  const withdrawsEverything = withdrawsEntireKaminoPosition(decoded)

  return (
    <VStack gap={12}>
      <List>
        <ListItem
          title={t('action')}
          extra={
            isDeposit ? t('kamino_earn_deposit') : t('kamino_earn_withdraw')
          }
          hoverable={false}
        />
        <ListItem
          title={t('vault')}
          extra={decoded.descriptor.fallbackName}
          hoverable={false}
        />
        {isDeposit ? (
          <>
            <ListItem
              title={t('amount')}
              extra={`${amount} ${coin.ticker}`}
              hoverable={false}
            />
            {priceUsd > 0 ? (
              <ListItem
                title={t('value')}
                extra={formatFiatAmount(Number(amount) * priceUsd)}
                hoverable={false}
              />
            ) : null}
          </>
        ) : (
          <ListItem
            title={t('kamino_earn_shares_burned')}
            // The sentinel is a marker, not a share count: rendering it as
            // 18.4 quintillion shares would be literally true and would say
            // nothing about what the transaction does.
            extra={
              withdrawsEverything ? t('kamino_earn_entire_position') : amount
            }
            hoverable={false}
          />
        )}
      </List>
      {decoded.strandsWrappedSolRent ? (
        <Text size={12} color="shy">
          {t('kamino_earn_strands_wrapped_sol_rent')}
        </Text>
      ) : null}
    </VStack>
  )
}
