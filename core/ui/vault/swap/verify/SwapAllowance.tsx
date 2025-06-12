import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { useSwapKeysignPayloadQuery } from '@core/ui/vault/swap/queries/useSwapKeysignPayloadQuery'
import { ListItem } from '@lib/ui/list/item'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'

export const SwapAllowance = () => {
  const { t } = useTranslation()
  const query = useSwapKeysignPayloadQuery()

  return (
    <MatchQuery
      value={query}
      error={() => null}
      pending={() => null}
      success={({ erc20ApprovePayload, coin }) => {
        if (!erc20ApprovePayload) return null

        const { decimals, ticker } = shouldBePresent(coin)

        return (
          <ListItem
            description={formatTokenAmount(
              fromChainAmount(erc20ApprovePayload.amount, decimals),
              ticker
            )}
            title={t('allowance')}
          />
        )
      }}
    />
  )
}
