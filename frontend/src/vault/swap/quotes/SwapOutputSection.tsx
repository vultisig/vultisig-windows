import { SyntheticEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { Chain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { useCurrentSendCoin } from '../../send/state/sendCoin';
import { useAssertCurrentVaultCoin } from '../../state/useCurrentVault';
import { getOutputAssetAmount } from '../../utils/helpers';
import { useSendSpecificTxInfo } from '../fee/SendSpecificTxInfoProvider';
import { useCoinTo } from '../state/coin-to';
import { SwapProtocolType, SwapQuote } from '../types';
import { convertSeconds } from '../utils';

type SwapOutputSectionProps = {
  onClick: (e: SyntheticEvent) => void;
  isActive: boolean;
  quote: SwapQuote;
  type: SwapProtocolType;
};

export default function SwapOutputSection({
  onClick,
  isActive,
  quote,
  type,
}: SwapOutputSectionProps) {
  const { t } = useTranslation();
  const [coinKey] = useCurrentSendCoin();
  const [coinTo] = useCoinTo();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const priceQuery = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin))
  );

  const { globalCurrency } = useGlobalCurrency();

  const { fee } = useSendSpecificTxInfo();

  const { decimals } = getChainFeeCoin(coinKey.chainId);

  const feeAmount = fromChainAmount(fee, decimals);

  const getQuoteSlippage = (amount: number) => {
    const percentage = amount / 100;
    if (percentage >= 10) {
      return (
        <span className="text-[12px] text-alert-red font-light">
          {percentage}% {t('slippage').toLowerCase()}
        </span>
      );
    }
    if (percentage <= 2) {
      return (
        <span className="text-[12px] text-turquoise-600 font-light">
          {percentage}% {t('slippage').toLowerCase()}
        </span>
      );
    }
    return (
      <span className="text-[12px] text-warning font-light">
        {percentage}% {t('slippage').toLowerCase()}
      </span>
    );
  };

  const swapOutputTitle = useMemo(() => {
    if (type === SwapProtocolType.MAYA) {
      return 'MAYA Base';
    }
    if (type === SwapProtocolType.MAYA_STREAMING) {
      return 'MAYA Streaming';
    }
    return type === SwapProtocolType.THORPriceOptimised
      ? 'Price optimised'
      : 'Time optimised';
  }, [type]);

  const logo = useMemo(() => {
    if (
      type === SwapProtocolType.THORPriceOptimised ||
      type === SwapProtocolType.THORTimeOptimised
    ) {
      return (
        <img
          src={getChainEntityIconSrc('thorchain')}
          alt="throchain"
          className="w-[24px] h-[24px]"
        />
      );
    }
    if (
      type === SwapProtocolType.MAYA ||
      type === SwapProtocolType.MAYA_STREAMING
    ) {
      return (
        <img
          src={getChainEntityIconSrc('mayachain')}
          alt="throchain"
          className="w-[24px] h-[24px]"
        />
      );
    }
  }, [type]);

  return (
    <button
      onClick={onClick}
      className="p-[16px] bg-neutral-700 rounded-[12px]"
      style={{
        border: `1px solid ${isActive ? '#5ED5A8' : '#25364A'}`,
        marginBottom: '20px',
      }}
    >
      <div className="justify-between flex">
        <div className="flex flex-1 justify-between">
          <div>
            <div className="gap-[4px] flex items-center">
              <span className="text-[12px] font-medium">{swapOutputTitle}</span>
            </div>
            <div className="gap-[2px] flex items-center">
              {(quote.streaming_swap_seconds ||
                quote.total_swap_seconds ||
                quote.outbound_delay_seconds !== undefined) && (
                <span className="text-neutral-300 text-[12px] font-light">
                  {convertSeconds(
                    quote.streaming_swap_seconds,
                    quote.total_swap_seconds ||
                      quote.outbound_delay_seconds ||
                      0
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`flex-1 justify-end text-right`}>
          <span className="text-[18px] text-right font-bold">
            {formatAmount(
              +getOutputAssetAmount(
                quote.expected_amount_out as string,
                coinTo?.chain === Chain.MayaChain
              )
            )}{' '}
            {coinTo?.ticker}
          </span>
          <div className="gap-[4px] mb-[8px] justify-end flex">
            <span className="text-[12px] text-green font-light">
              {getQuoteSlippage(
                quote.fees.slippage_bps || quote.slippage_bps || 0
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="justify-between items-end flex">
        <div className="flex-1">{logo}</div>
        <div className="flex items-center rounded-[12px] px-[12px] py-[8px] border-[1px] border-neutral-500 bg-blue-800 gap-[8px]">
          <span className="text-neutral-300 font-medium">
            Fees $
            {formatAmount(
              feeAmount * (priceQuery.data || 0) + +quote.fees.totalInUsd,
              globalCurrency
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
