import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { TxOverviewAmount } from '@core/ui/chain/tx/TxOverviewAmount'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import {
  TxOverviewChainDataRow,
  TxOverviewPrimaryRowTitle,
  TxOverviewRow,
} from '@core/ui/chain/tx/TxOverviewRow'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { assertField } from '@lib/utils/record/assertField'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormatFiatAmount } from '../../../../chain/hooks/useFormatFiatAmount'

export const JoinKeysignTxPrimaryInfo = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const { toAddress, memo, toAmount, blockchainSpecific } = value

  const coin = fromCommCoin(assertField(value, 'coin'))

  const { decimals, ticker } = shouldBePresent(coin)

  const { t } = useTranslation()

  const coinPriceQuery = useCoinPriceQuery({
    coin,
  })

  const formatFiatAmount = useFormatFiatAmount()

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) return null

    return formatFee({
      chain: coin.chain as Chain,
      amount: getFeeAmount(blockchainSpecific),
    })
  }, [blockchainSpecific, coin.chain])

  return (
    <>
      <TxOverviewChainDataRow>
        <TxOverviewPrimaryRowTitle>{t('from')}</TxOverviewPrimaryRowTitle>
        <span>{coin.address}</span>
      </TxOverviewChainDataRow>

      <TxOverviewChainDataRow>
        <TxOverviewPrimaryRowTitle>{t('to')}</TxOverviewPrimaryRowTitle>
        <span>{toAddress}</span>
      </TxOverviewChainDataRow>
      {memo && <TxOverviewMemo value={memo} chain={coin.chain} />}
      <TxOverviewAmount
        value={fromChainAmount(BigInt(toAmount), decimals)}
        ticker={ticker}
      />
      <MatchQuery
        value={coinPriceQuery}
        success={price =>
          price ? (
            <TxOverviewRow>
              <span>{t('value')}</span>
              <span>
                {formatFiatAmount(
                  fromChainAmount(BigInt(toAmount), decimals) * price
                )}
              </span>
            </TxOverviewRow>
          ) : null
        }
        error={() => null}
        pending={() => null}
      />
      {networkFeesFormatted && (
        <TxOverviewRow>
          <span>{t('network_fee')}</span>
          <span>{networkFeesFormatted}</span>
        </TxOverviewRow>
      )}
    </>
  )
}
