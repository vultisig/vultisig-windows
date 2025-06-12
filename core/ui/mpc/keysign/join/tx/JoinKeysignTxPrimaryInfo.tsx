import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { MiddleTruncate } from '@lib/ui/truncate'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { assertField } from '@lib/utils/record/assertField'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const JoinKeysignTxPrimaryInfo = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()
  const { toAddress, memo, toAmount, blockchainSpecific } = value
  const coin = fromCommCoin(assertField(value, 'coin'))
  const { decimals, ticker } = shouldBePresent(coin)
  const coinPriceQuery = useCoinPriceQuery({ coin })
  const fiatCurrency = useFiatCurrency()

  const networkFeesFormatted = useMemo(() => {
    return blockchainSpecific.value
      ? formatFee({
          chain: coin.chain as Chain,
          chainSpecific: blockchainSpecific,
        })
      : null
  }, [blockchainSpecific, coin.chain])

  return (
    <>
      <ListItem
        description={<MiddleTruncate text={coin.address} />}
        title={t('from')}
      />
      <ListItem
        description={<MiddleTruncate text={toAddress} />}
        title={t('to')}
      />
      {memo && <TxOverviewMemo value={memo} />}
      <ListItem
        description={formatTokenAmount(
          fromChainAmount(BigInt(toAmount), decimals),
          ticker
        )}
        title={t('amount')}
      />
      <MatchQuery
        value={coinPriceQuery}
        error={() => null}
        pending={() => null}
        success={price =>
          price ? (
            <ListItem
              description={formatAmount(
                fromChainAmount(BigInt(toAmount), decimals) * price,
                fiatCurrency
              )}
              title={t('value')}
            />
          ) : null
        }
      />
      {networkFeesFormatted ? (
        <ListItem description={networkFeesFormatted} title={t('network_fee')} />
      ) : null}
    </>
  )
}
