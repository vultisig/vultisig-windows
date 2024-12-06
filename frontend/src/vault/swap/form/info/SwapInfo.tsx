import { StrictInfoRow } from '../../../../lib/ui/layout/StrictInfoRow';
import { ActiveQueryOnly } from '../../../../lib/ui/query/components/ActiveQueryOnly';
import { WarningBlock } from '../../../../lib/ui/status/WarningBlock';
import { extractErrorMsg } from '../../../../lib/utils/error/extractErrorMsg';
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery';
import { SwapProvider } from './SwapProvider';
import { SwapTotalFee } from './SwapTotalFee';

export const SwapInfo = () => {
  const query = useSwapQuoteQuery();

  if (query.error) {
    return <WarningBlock>{extractErrorMsg(query.error)}</WarningBlock>;
  }

  return (
    <ActiveQueryOnly value={query}>
      <SwapProvider />
      <StrictInfoRow>
        <SwapTotalFee />
      </StrictInfoRow>
    </ActiveQueryOnly>
  );
};
