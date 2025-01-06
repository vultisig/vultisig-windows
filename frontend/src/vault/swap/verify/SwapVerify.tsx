import { useTranslation } from 'react-i18next';

import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { TxOverviewPrimaryRow } from '../../../chain/tx/components/TxOverviewPrimaryRow';
import { TxOverviewRow } from '../../../chain/tx/components/TxOverviewRow';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { range } from '../../../lib/utils/array/range';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { SwapFees } from '../form/info/SwapFees';
import { useSwapOutputAmountQuery } from '../queries/useSwapOutputAmountQuery';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';
import { swapTermsCount, SwapTermsProvider } from './state/swapTerms';
import { SwapAllowance } from './SwapAllowance';
import { SwapConfirm } from './SwapConfirm';
import { SwapTerms } from './SwapTerms';

export const SwapVerify: React.FC<ComponentWithBackActionProps> = ({
  onBack,
}) => {
  const { t } = useTranslation();

  const [fromCoinKey] = useFromCoin();
  const [toCoinKey] = useToCoin();

  const fromCoin = useCurrentVaultCoin(fromCoinKey);
  const toCoin = useCurrentVaultCoin(toCoinKey);

  const [fromAmount] = useFromAmount();

  const outAmountQuery = useSwapOutputAmountQuery();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <TxOverviewPrimaryRow title={t('from')}>
              {formatAmount(shouldBePresent(fromAmount), fromCoin.ticker)}
            </TxOverviewPrimaryRow>
            <TxOverviewPrimaryRow title={t('to')}>
              <MatchQuery
                value={outAmountQuery}
                error={() => t('failed_to_load')}
                pending={() => t('loading')}
                success={amount => formatAmount(amount, toCoin.ticker)}
              />
            </TxOverviewPrimaryRow>

            <SwapAllowance />
            <SwapFees RowComponent={TxOverviewRow} />
          </TxOverviewPanel>
        </WithProgressIndicator>
        <SwapTermsProvider
          initialValue={range(swapTermsCount).map(() => false)}
        >
          <VStack gap={20}>
            <SwapTerms />
            <SwapConfirm />
          </VStack>
        </SwapTermsProvider>
      </PageContent>
    </>
  );
};
