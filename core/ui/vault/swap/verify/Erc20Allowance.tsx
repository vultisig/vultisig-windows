import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { GetErc20AllowanceInput } from '@core/chain/chains/evm/erc20/getErc20Allowance'
import { Coin } from '@core/chain/coin/Coin'
import { TxOverviewChainDataRow } from '@core/ui/chain/tx/TxOverviewRow'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'

import { useErc20Allowance } from '../../../chain/evm/queries/erc20Allowance'

type Erc20AllowanceProps = GetErc20AllowanceInput &
  Pick<Coin, 'decimals' | 'ticker'>

export const Erc20Allowance = ({
  decimals,
  ticker,
  ...input
}: Erc20AllowanceProps) => {
  const query = useErc20Allowance(input)

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      error={() => null}
      pending={() => null}
      success={value => {
        return (
          <TxOverviewChainDataRow>
            <span>{t('allowance')}</span>
            <span>
              {formatTokenAmount(fromChainAmount(value, decimals), ticker)}
            </span>
          </TxOverviewChainDataRow>
        )
      }}
    />
  )
}
