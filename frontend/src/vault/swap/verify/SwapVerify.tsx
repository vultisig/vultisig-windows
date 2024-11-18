import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { isNativeCoin } from '../../../chain/utils/isNativeCoin';
import { getCoinMetaIconSrc } from '../../../coin/utils/coinMeta';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { range } from '../../../lib/utils/array/range';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { Chain } from '../../../model/chain';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { formatMidgardNumber } from '../../../utils/midgard';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import {
  useCurrentVaultAddreses,
  useCurrentVaultCoin,
} from '../../state/currentVault';
import { SendFee } from '../fee/SendFee';
import { SendFiatFee } from '../fee/SendFiatFee';
import TotalFee from '../fee/TotalFee';
import { useSwapAmount } from '../state/amount';
import { useCoinTo } from '../state/coin-to';
import { useSendReceiver } from '../state/receiver';
import { useSwapQuote } from '../state/selected-quote';
import { useSwapProtocol } from '../state/swap-protocol-type';
import { useCurrentSwapCoin } from '../state/swapCoin';
import { SwapProtocolType } from '../types';
import { convertSeconds } from '../utils';
import { swapTermsCount, SwapTermsProvider } from './state/swapTerms';
import { SwapConfirm } from './SwapConfirm';
import { SwapTerms } from './SwapTerms';

export const SwapVerify: React.FC<ComponentWithBackActionProps> = ({
  onBack,
}) => {
  const { t } = useTranslation();
  const addresses = useCurrentVaultAddreses();
  const [coinKey] = useCurrentSwapCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const { id, chainId } = coinKey;
  const [amount] = useSwapAmount();
  const [swapProtocol] = useSwapProtocol();
  const [coinTo] = useCoinTo();
  const [selectedSwapQuote] = useSwapQuote();
  const [receiver] = useSendReceiver();

  const sender = addresses[coin.chain as Chain];

  const isMaya =
    swapProtocol === SwapProtocolType.MAYA ||
    swapProtocol === SwapProtocolType.MAYA_STREAMING;

  const slippage = +new BigNumber(
    selectedSwapQuote?.fees.slippage_bps || selectedSwapQuote?.slippage_bps || 0
  )
    .dividedBy(100)
    .toFixed(2);

  const slippageColor = useMemo(() => {
    if (!slippage) {
      return 'text-neutral-300';
    }
    if (+slippage >= 10) {
      return 'text-alert-red';
    }
    if (+slippage <= 2) {
      return 'text-turquoise-600';
    }
    return 'text-turquoise-600';
  }, [slippage]);

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <VStack gap={4}>
              <HStack fullWidth justifyContent="space-between">
                <Text weight="600" size={20} color="contrast">
                  From
                </Text>
                <div className="gap-[6px] mb-[12px] items-center flex">
                  <div className="relative">
                    <ChainCoinIcon
                      coinSrc={getCoinMetaIconSrc(coin)}
                      chainSrc={
                        isNativeCoin({ id, chainId })
                          ? undefined
                          : getChainEntityIconSrc(chainId)
                      }
                      style={{ fontSize: 32 }}
                    />
                  </div>
                  <Text weight="600" color="contrast">
                    {coin.ticker}
                  </Text>
                </div>
              </HStack>
              <HStack fullWidth justifyContent="space-between">
                <Text family="mono" color="primary" size={14}>
                  {sender}
                </Text>
              </HStack>
            </VStack>
            <VStack gap={4}>
              <HStack fullWidth justifyContent="space-between">
                <Text weight="600" size={20} color="contrast">
                  To
                </Text>
                <div className="gap-[6px] mb-[12px] items-center flex">
                  <ChainCoinIcon
                    coinSrc={coinTo?.logo}
                    chainSrc={
                      coinTo?.is_native_token
                        ? undefined
                        : getChainEntityIconSrc(coinTo?.chain || '')
                    }
                    style={{ fontSize: 32 }}
                  />
                  <Text weight="600" color="contrast">
                    {coinTo?.ticker}
                  </Text>
                </div>
              </HStack>
              <HStack fullWidth justifyContent="space-between">
                <Text family="mono" color="primary" size={14} weight="400">
                  {receiver}
                </Text>
              </HStack>
            </VStack>
            <HStack fullWidth justifyContent="space-between">
              <TxOverviewAmount
                value={shouldBePresent(amount)}
                symbol={coin.ticker}
              />
            </HStack>
            <HStack fullWidth justifyContent="space-between">
              <Text weight="600" color="contrast">
                Est. receive amount
              </Text>
              <VStack gap="4px">
                <Text family="mono" weight="600" color="contrast">
                  {formatAmount(
                    formatMidgardNumber(
                      selectedSwapQuote?.expected_amount_out || '0',
                      isMaya
                    ).toNumber()
                  )}{' '}
                  {coinTo?.ticker}
                </Text>
              </VStack>
            </HStack>
            <HStack fullWidth justifyContent="space-between">
              <Text weight="600" color="contrast">
                Memo
              </Text>
              <VStack gap="4px">
                <Text family="mono">{selectedSwapQuote?.memo}</Text>
              </VStack>
            </HStack>
            <HStack fullWidth justifyContent="space-between">
              <VStack className="flex-1" gap="4px" alignItems="center">
                <Text>Est. time</Text>
                <span className={`font-medium text-neutral-300`}>
                  {convertSeconds(
                    isMaya
                      ? selectedSwapQuote?.outbound_delay_seconds
                      : selectedSwapQuote?.streaming_swap_seconds
                  )}
                </span>
              </VStack>
              <VStack className="flex-1" gap="4px" alignItems="center">
                <Text>Total fee</Text>
                <TotalFee />
              </VStack>
              <VStack className="flex-1" gap="4px" alignItems="center">
                <Text>Slippage</Text>
                <span className={`font-medium ${slippageColor}`}>
                  {slippage}%
                </span>
              </VStack>
            </HStack>
            <HStack fullWidth justifyContent="space-between">
              <VStack className="flex-1" gap="4px" alignItems="center">
                <SendFee />
              </VStack>
              <VStack className="flex-1" gap="4px" alignItems="center">
                <SendFiatFee />
              </VStack>
              <VStack className="flex-1" gap="4px" alignItems="center">
                <Text>Affiliate Fee</Text>
                <span className="font-medium text-neutral-300">
                  {selectedSwapQuote?.affiliateInPercentage || '0'}%
                </span>
              </VStack>
            </HStack>
          </TxOverviewPanel>
          <SwapTermsProvider
            initialValue={range(swapTermsCount).map(() => false)}
          >
            <VStack gap={20}>
              <SwapTerms />
              <SwapConfirm />
            </VStack>
          </SwapTermsProvider>
        </WithProgressIndicator>
      </PageContent>
    </>
  );
};
