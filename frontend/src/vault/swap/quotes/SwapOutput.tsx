import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Skeleton from '../../../components/skeleton';
import { textInputBackground } from '../../../lib/ui/css/textInput';
import { Chain } from '../../../model/chain';
import { getOutputAssetAmount } from '../../utils/helpers';
import { useCoinTo } from '../state/coin-to';
import { useSwapProtocol } from '../state/swap-protocol-type';
import { SwapProtocolType, SwapQuote } from '../types';
import SwapOutputSection from './SwapOutputSection';

type SwapOutputProps = {
  isLoading: boolean;
  timeOptimisedQuote: SwapQuote | null;
  priceOptimisedQuote: SwapQuote | null;
  mayaQuote: SwapQuote | null;
  mayaStreamingQuote: SwapQuote | null;
  handleChangeSwapOptimiseType: (val: SwapProtocolType) => void;
};

export default function SwapOutput({
  isLoading,
  timeOptimisedQuote,
  priceOptimisedQuote,
  mayaQuote,
  mayaStreamingQuote,
  handleChangeSwapOptimiseType,
}: SwapOutputProps) {
  const { t } = useTranslation();
  const [coinTo] = useCoinTo();
  const [swapProtocol] = useSwapProtocol();

  const quotes = useMemo(() => {
    const availableQuotes = [];
    if (timeOptimisedQuote) {
      availableQuotes.push({
        ...timeOptimisedQuote,
        type: SwapProtocolType.THORTimeOptimised,
      });
    }
    if (priceOptimisedQuote) {
      availableQuotes.push({
        ...priceOptimisedQuote,
        type: SwapProtocolType.THORPriceOptimised,
      });
    }
    if (mayaQuote) {
      availableQuotes.push({
        ...mayaQuote,
        type: SwapProtocolType.MAYA,
      });
    }
    if (mayaStreamingQuote) {
      availableQuotes.push({
        ...mayaStreamingQuote,
        type: SwapProtocolType.MAYA_STREAMING,
      });
    }
    return availableQuotes.sort((quoteA, quoteB) => {
      return (
        +getOutputAssetAmount(
          quoteB.expected_amount_out as string,
          coinTo?.chain === Chain.MayaChain
        ) -
        +getOutputAssetAmount(
          quoteA.expected_amount_out as string,
          coinTo?.chain === Chain.MayaChain
        )
      );
    });
  }, [
    timeOptimisedQuote,
    priceOptimisedQuote,
    mayaQuote,
    mayaStreamingQuote,
    coinTo?.chain,
  ]);

  return isLoading ? (
    <div className="mt-[12px]">
      <Skeleton height="388px" />
    </div>
  ) : (
    <>
      {swapProtocol && (
        <>
          <div
            className="flex flex-col rounded-[12px] backdrop-blur-2xl border-[1px] border-neutral-500 p-[20px] pb-0 overflow-auto"
            style={{
              background: `${textInputBackground}`,
            }}
          >
            {quotes.map(quote => (
              <SwapOutputSection
                quote={quote}
                onClick={e => {
                  e.preventDefault();
                  handleChangeSwapOptimiseType(quote.type);
                }}
                isActive={swapProtocol === quote.type}
                type={quote.type}
                key={quote.type}
              />
            ))}
          </div>
        </>
      )}
      {!quotes.length && (
        <div
          className={`rounded-[12px] bg-blue-800 backdrop-blur-2xl border-[1px] border-neutral-500 p-[20px] pb-0 overflow-auto mt-[12px] flex flex-col`}
        >
          <span className="text-alert-red pb-[20px] font-medium">
            <Trans t={t}>page.swap.quote.amount.error</Trans>
          </span>
        </div>
      )}
    </>
  );
}
