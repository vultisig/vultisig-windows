import { ThorchainSwapQuote } from '../../../../chain/thor/swap/api/ThorchainSwapQuote';
import { thorchainSwapConfig } from '../../../../chain/thor/swap/config';
import { fromThorchainSwapAsset } from '../../../../chain/thor/swap/utils/swapAsset';
import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { FiatAmount } from '../../../../coin/ui/FiatAmount';

type SwapTotalFeeValueProps = {
  swapQuote: ThorchainSwapQuote;
};

export const SwapTotalFeeValue = ({ swapQuote }: SwapTotalFeeValueProps) => {
  return (
    <FiatAmount
      coin={fromThorchainSwapAsset(swapQuote.fees.asset)}
      amount={fromChainAmount(
        swapQuote.fees.total,
        thorchainSwapConfig.decimals
      )}
    />
  );
};
