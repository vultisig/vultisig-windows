import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'

import { TxOverviewChainDataRow } from '../../../chain/tx/components/TxOverviewRow'
import { useSwapKeysignPayloadQuery } from '../queries/useSwapKeysignPayloadQuery'

export const SwapAllowance = () => {
  const query = useSwapKeysignPayloadQuery()

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      error={() => null}
      pending={() => null}
      success={({ erc20ApprovePayload, coin }) => {
        if (!erc20ApprovePayload) {
          return null
        }

        const { decimals, ticker } = shouldBePresent(coin)

        return (
          <TxOverviewChainDataRow>
            <span>{t('allowance')}</span>
            <span>
              {formatTokenAmount(
                fromChainAmount(erc20ApprovePayload.amount, decimals),
                ticker
              )}
            </span>
          </TxOverviewChainDataRow>
        )
      }}
    />
  )
}
