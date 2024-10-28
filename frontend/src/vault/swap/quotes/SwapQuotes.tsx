import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';

import { useThorwalletApi } from '../../../lib/hooks/use-thorwallet-api';
import { SwapQuoteParams } from '../../../lib/types/swap';
import { debounce } from '../../../lib/utils/debounce';
import { Chain } from '../../../model/chain';
import { convertChainToChainTicker } from '../../../utils/crypto';
import {
  useAssertCurrentVaultAddreses,
  useAssertCurrentVaultCoin,
} from '../../state/useCurrentVault';
import { SendSpecificTxInfoProvider } from '../fee/SendSpecificTxInfoProvider';
import { useIsSendFormDisabled } from '../form/hooks/useIsSendFormDisabled';
import { useSwapAmount } from '../state/amount';
import { useCoinTo } from '../state/coin-to';
import { useSendReceiver } from '../state/receiver';
import { useSwapQuote } from '../state/selected-quote';
import { useSwapProtocol } from '../state/swap-protocol-type';
import { useCurrentSwapCoin } from '../state/swapCoin';
import { SwapProtocolType, SwapQuote } from '../types';
import SwapOutput from './SwapOutput';

export default function SwapQuotes() {
  const [amount] = useSwapAmount();
  const [coinKey] = useCurrentSwapCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const addresses = useAssertCurrentVaultAddreses();
  const isDisabled = useIsSendFormDisabled();
  const [coinTo] = useCoinTo();
  const [recipient] = useSendReceiver();
  const [swapQuotesLoading, setSwapQuotesLoading] = useState(false);
  const { getSwapQuotes } = useThorwalletApi();
  const [priceOptimisedQuote, setPriceOptimisedQuote] =
    useState<SwapQuote | null>(null);
  const [timeOptimisedQuote, setTimeOptimisedQuote] =
    useState<SwapQuote | null>(null);
  const [mayaQuote, setMayaQuote] = useState<SwapQuote | null>(null);
  const [mayaStreamingQuote, setMayaStreamingQuote] =
    useState<SwapQuote | null>(null);
  const [swapProtocol, setSwapProtocol] = useSwapProtocol();
  const [quote, setSelectedQuote] = useSwapQuote();

  console.log(swapProtocol);
  console.log(quote);

  const handleChangeSwapProtocol = (type: SwapProtocolType) => {
    setSwapProtocol(type);
    if (type === SwapProtocolType.THORPriceOptimised) {
      setSelectedQuote(priceOptimisedQuote);
      return;
    }
    if (type === SwapProtocolType.THORTimeOptimised) {
      setSelectedQuote(timeOptimisedQuote);
      return;
    }
    if (type === SwapProtocolType.MAYA) {
      setSelectedQuote(mayaQuote);
      return;
    }
    if (type === SwapProtocolType.MAYA_STREAMING) {
      setSelectedQuote(mayaStreamingQuote);
      return;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadSwapQuotes = useCallback(
    debounce(async function (params: SwapQuoteParams) {
      const data = await getSwapQuotes(params);
      let maxToAmount = '0';
      let bestProtocol;
      let error = '';
      if (data.thorchain.base.quote) {
        setTimeOptimisedQuote(data.thorchain.base.quote);
        bestProtocol = data.thorchain.base.quote;
        if (
          new BigNumber(
            data.thorchain.base.quote.expected_amount_out
          ).isGreaterThanOrEqualTo(new BigNumber(maxToAmount))
        ) {
          maxToAmount = data.thorchain.base.quote.expected_amount_out;
        }
      } else {
        if (data.thorchain.base.error?.includes('halted')) {
          error = "Trading is halted for selected pair, can't process swap";
        } else if (
          data.thorchain.base.error?.includes('Swapping to a smart contract')
        ) {
          error =
            'Swapping to a smart contract is not possible! Enter a different recipient address.';
        }
        setTimeOptimisedQuote(null);
      }
      if (data.thorchain.streaming.quote) {
        setPriceOptimisedQuote(data.thorchain.streaming.quote);
        if (
          new BigNumber(
            data.thorchain.streaming.quote.expected_amount_out
          ).isGreaterThanOrEqualTo(new BigNumber(maxToAmount))
        ) {
          maxToAmount = data.thorchain.streaming.quote.expected_amount_out;
          setSwapProtocol(SwapProtocolType.THORPriceOptimised);
          bestProtocol = data.thorchain.streaming.quote;
        }
      } else {
        if (data.thorchain.streaming.error?.includes('halted')) {
          error = "Trading is halted for selected pair, can't process swap";
        } else if (
          data.thorchain.streaming.error?.includes(
            'Swapping to a smart contract'
          )
        ) {
          error =
            'Swapping to a smart contract is not possible! Enter a different recipient address.';
        }
        setPriceOptimisedQuote(null);
      }
      if (data.maya.quote) {
        if (
          new BigNumber(
            data.maya.quote.expected_amount_out
          ).isGreaterThanOrEqualTo(new BigNumber(maxToAmount))
        ) {
          maxToAmount = data.maya.quote.expected_amount_out;
          setSwapProtocol(SwapProtocolType.MAYA);
          bestProtocol = data.maya.quote;
        }
        setMayaQuote(data.maya.quote);
      } else {
        if (data.maya.error?.includes('halted')) {
          error = "Trading is halted for selected pair, can't process swap";
        } else if (data.maya.error?.includes('Swapping to a smart contract')) {
          error =
            'Swapping to a smart contract is not possible! Enter a different recipient address.';
        }
        setMayaQuote(null);
      }
      if (data.mayaStreaming.quote) {
        if (
          new BigNumber(
            data.mayaStreaming.quote.expected_amount_out
          ).isGreaterThanOrEqualTo(new BigNumber(maxToAmount))
        ) {
          maxToAmount = data.mayaStreaming.quote.expected_amount_out;
          setSwapProtocol(SwapProtocolType.MAYA_STREAMING);
          bestProtocol = data.mayaStreaming.quote;
        }
        setMayaStreamingQuote(data.mayaStreaming.quote);
      } else {
        if (data.mayaStreaming.error?.includes('halted')) {
          error = "Trading is halted for selected pair, can't process swap";
        } else if (
          data.mayaStreaming.error?.includes('Swapping to a smart contract')
        ) {
          error =
            'Swapping to a smart contract is not possible! Enter a different recipient address.';
        }
        setMayaStreamingQuote(null);
      }
      if (bestProtocol) {
        setSelectedQuote(bestProtocol);
      }
      console.log(error);
      setSwapQuotesLoading(false);
    }, 500),
    [coin]
  );

  useEffect(() => {
    if (amount && !isDisabled) {
      setSwapQuotesLoading(true);
      setSwapProtocol(null);
      setMayaQuote(null);
      setMayaStreamingQuote(null);
      // Todo add other protocols erase
      loadSwapQuotes({
        fromAsset: `${convertChainToChainTicker(coin.chain as Chain)}.${coin.ticker}${coin.contract_address ? `-${coin.contract_address}` : ''}`,
        toAsset: `${convertChainToChainTicker(coinTo?.chain as Chain)}.${coinTo?.ticker}${coinTo?.contract_address ? `-${coinTo.contract_address}` : ''}`,
        amount: amount.toString(),
        toleranceBps: 10000,
        destination: recipient,
        fromAddress: addresses[coin.chain as Chain],
        fromAssetDecimal: coin.decimals,
        toAssetDecimal: coinTo?.decimals || 18,
        ethAddress: addresses['Ethereum'] || undefined,
      });
    }
  }, [
    isDisabled,
    loadSwapQuotes,
    addresses,
    amount,
    setSwapProtocol,
    coin,
    coinTo,
    recipient,
  ]);

  if (!amount) {
    return null;
  }

  return (
    <SendSpecificTxInfoProvider>
      <SwapOutput
        isLoading={swapQuotesLoading}
        mayaQuote={mayaQuote}
        mayaStreamingQuote={mayaStreamingQuote}
        priceOptimisedQuote={priceOptimisedQuote}
        timeOptimisedQuote={timeOptimisedQuote}
        handleChangeSwapOptimiseType={handleChangeSwapProtocol}
      />
    </SendSpecificTxInfoProvider>
  );
}
