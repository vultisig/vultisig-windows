import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';
import { useCurrentTxHash } from '../../../chain/state/currentTxHash';
import { nativeSwapChains } from '../../../chain/swap/native/NativeSwapChain';
import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import {
  TxOverviewChainDataRow,
  TxOverviewRow,
} from '../../../chain/tx/components/TxOverviewRow';
import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { useCopyTxHash } from '../../../chain/ui/hooks/useCopyTxHash';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { getBlockExplorerUrl } from '../../../chain/utils/getBlockExplorerUrl';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { CopyIcon } from '../../../lib/ui/icons/CopyIcon';
import { LinkIcon } from '../../../lib/ui/icons/LinkIcon';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { Text } from '../../../lib/ui/text';
import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { matchDiscriminatedUnion } from '../../../lib/utils/matchDiscriminatedUnion';
import { Chain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { KeysignSwapTxInfo } from '../../swap/keysign/KeysignSwapTxInfo';
import { SwapTrackingLink } from './SwapTrackingLink';

export const KeysignTxOverview = ({
  value,
}: ComponentWithValueProps<KeysignPayload>) => {
  const txHash = useCurrentTxHash();

  const { t } = useTranslation();

  const copyTxHash = useCopyTxHash();
  const { globalCurrency } = useGlobalCurrency();
  const {
    coin: potentialCoin,
    toAddress,
    memo,
    toAmount,
    blockchainSpecific,
    swapPayload,
  } = value;

  const isSwapTx =
    (swapPayload && swapPayload.value) ||
    memo?.startsWith('=') ||
    memo?.toLowerCase().startsWith('swap');
  const coin = shouldBePresent(potentialCoin);

  const { decimals } = shouldBePresent(coin);
  const coinPriceQuery = useCoinPriceQuery(CoinMeta.fromCoin(coin));

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return null;

    return fromChainAmount(BigInt(toAmount), decimals);
  }, [toAmount, decimals]);

  const { chain } = shouldBePresent(coin);

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) return null;

    return formatFee({
      chain: chain as Chain,
      chainSpecific: blockchainSpecific,
    });
  }, [blockchainSpecific, chain]);

  const blockExplorerChain: Chain = useMemo(() => {
    if (isSwapTx && swapPayload && swapPayload.value) {
      return matchDiscriminatedUnion(swapPayload, 'case', 'value', {
        thorchainSwapPayload: () => Chain.THORChain,
        mayachainSwapPayload: () => Chain.MayaChain,
        oneinchSwapPayload: () => chain as Chain,
      });
    }

    return chain as Chain;
  }, [chain, isSwapTx, swapPayload]);

  const blockExplorerUrl = getBlockExplorerUrl({
    chain: blockExplorerChain,
    entity: 'tx',
    value: txHash,
  });

  return (
    <>
      <VStack gap={16}>
        <HStack alignItems="center" gap={4}>
          <Text weight="600" size={20} color="contrast">
            {t('transaction')}
          </Text>
          <IconButton icon={<CopyIcon />} onClick={() => copyTxHash(txHash)} />
          <IconButton
            onClick={() => {
              BrowserOpenURL(blockExplorerUrl);
            }}
            icon={<LinkIcon />}
          />
        </HStack>
        <Text family="mono" color="primary" size={14} weight="400">
          {txHash}
        </Text>
      </VStack>

      {swapPayload.value ? (
        <KeysignSwapTxInfo value={value} />
      ) : (
        <>
          {toAddress && (
            <TxOverviewRow>
              <span>{t('to')}</span>
              <span>{toAddress}</span>
            </TxOverviewRow>
          )}
          <TxOverviewAmount
            value={fromChainAmount(BigInt(toAmount), decimals)}
            ticker={coin.ticker}
          />
        </>
      )}
      {memo && (
        <TxOverviewChainDataRow>
          <span>{t('memo')}</span>
          <span>{memo}</span>
        </TxOverviewChainDataRow>
      )}
      {formattedToAmount && (
        <>
          <MatchQuery
            value={coinPriceQuery}
            success={price =>
              price ? (
                <TxOverviewRow>
                  <span>{t('value')}</span>
                  <span>
                    {formatAmount(formattedToAmount * price, globalCurrency)}
                  </span>
                </TxOverviewRow>
              ) : null
            }
            error={() => null}
            pending={() => null}
          />
        </>
      )}
      {networkFeesFormatted && (
        <TxOverviewRow>
          <span>{t('network_fee')}</span>
          <span>{networkFeesFormatted}</span>
        </TxOverviewRow>
      )}
      {isSwapTx && isOneOf(blockExplorerChain, nativeSwapChains) && (
        <SwapTrackingLink value={blockExplorerUrl} />
      )}
    </>
  );
};
