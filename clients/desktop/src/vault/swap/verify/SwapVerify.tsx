import { OnBackProp } from '@lib/ui/props'
import { range } from '@lib/utils/array/range'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'

import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel'
import {
  TxOverviewPrimaryRowTitle,
  TxOverviewRow,
} from '../../../chain/tx/components/TxOverviewRow'
import { VStack } from '../../../lib/ui/layout/Stack'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { PageContent } from '../../../ui/page/PageContent'
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator'
import { useCurrentVaultCoin } from '../../state/currentVault'
import { SwapFees } from '../form/info/SwapFees'
import { useSwapOutputAmountQuery } from '../queries/useSwapOutputAmountQuery'
import { useFromAmount } from '../state/fromAmount'
import { useFromCoin } from '../state/fromCoin'
import { useToCoin } from '../state/toCoin'
import { swapTermsCount, SwapTermsProvider } from './state/swapTerms'
import { SwapAllowance } from './SwapAllowance'
import { SwapConfirm } from './SwapConfirm'
import { SwapTerms } from './SwapTerms'

export const SwapVerify = () => {
  const { t } = useTranslation()

  const [fromCoinKey] = useFromCoin()
  const [toCoinKey] = useToCoin()

  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const [fromAmount] = useFromAmount()

  const outAmountQuery = useSwapOutputAmountQuery()

  return (
    <PageContent gap={40}>
      <WithProgressIndicator value={0.3}>
        <TxOverviewPanel>
          <TxOverviewRow>
            <TxOverviewPrimaryRowTitle>{t('from')}</TxOverviewPrimaryRowTitle>
            <span>
              {formatTokenAmount(shouldBePresent(fromAmount), fromCoin.ticker)}
            </span>
          </TxOverviewRow>
          <TxOverviewRow>
            <TxOverviewPrimaryRowTitle>{t('to')}</TxOverviewPrimaryRowTitle>
            <span>
              <MatchQuery
                value={outAmountQuery}
                error={() => t('failed_to_load')}
                pending={() => t('loading')}
                success={amount => formatTokenAmount(amount, toCoin.ticker)}
              />
            </span>
          </TxOverviewRow>

          <SwapAllowance />
          <SwapFees RowComponent={TxOverviewRow} />
        </TxOverviewPanel>
      </WithProgressIndicator>
      <SwapTermsProvider initialValue={range(swapTermsCount).map(() => false)}>
        <VStack gap={20}>
          <SwapTerms />
          <SwapConfirm />
        </VStack>
      </SwapTermsProvider>
    </PageContent>
  )
}
