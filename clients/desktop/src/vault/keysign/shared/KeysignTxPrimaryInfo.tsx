import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { assertField } from '@lib/utils/record/assertField'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount'
import { TxOverviewMemo } from '../../../chain/tx/components/TxOverviewMemo'
import {
  TxOverviewChainDataRow,
  TxOverviewPrimaryRowTitle,
  TxOverviewRow,
} from '../../../chain/tx/components/TxOverviewRow'
import { formatFee } from '../../../chain/tx/fee/utils/formatFee'
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery'
import { useFiatCurrency } from '../../../preferences/state/fiatCurrency'

export const KeysignTxPrimaryInfo = ({ value }: ValueProp<KeysignPayload>) => {
  const { toAddress, memo, toAmount, blockchainSpecific } = value

  const coin = fromCommCoin(assertField(value, 'coin'))

  const { decimals, ticker } = shouldBePresent(coin)

  const { t } = useTranslation()

  const coinPriceQuery = useCoinPriceQuery({
    coin,
  })

  const [fiatCurrency] = useFiatCurrency()

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) return null
    formatFee({
      chain: coin.chain as Chain,
      chainSpecific: blockchainSpecific,
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
      {memo && <TxOverviewMemo value={memo} />}
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
                {formatAmount(
                  fromChainAmount(BigInt(toAmount), decimals) * price,
                  fiatCurrency
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
