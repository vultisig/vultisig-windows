import { StrictInfoRow } from '../../../../lib/ui/layout/StrictInfoRow';
import { ActiveQueryOnly } from '../../../../lib/ui/query/components/ActiveQueryOnly';
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery';
import { SwapProvider } from './SwapProvider';
import { SwapTotalFee } from './SwapTotalFee';

export const SwapInfo = () => {
  const query = useSwapQuoteQuery();

  return (
    <ActiveQueryOnly value={query}>
      <SwapProvider />
      <StrictInfoRow>
        <SwapTotalFee />
      </StrictInfoRow>
    </ActiveQueryOnly>
  );
};
