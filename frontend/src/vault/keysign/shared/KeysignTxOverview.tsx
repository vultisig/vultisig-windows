import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';
import { useCurrentTxHash } from '../../../chain/state/currentTxHash';
import { useCopyTxHash } from '../../../chain/ui/hooks/useCopyTxHash';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { getBlockExplorerUrl } from '../../../chain/utils/getBlockExplorerUrl';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { CopyIcon } from '../../../lib/ui/icons/CopyIcon';
import { LinkIcon } from '../../../lib/ui/icons/LinkIcon';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { Chain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { KeysignTxOverviewRow } from './KeysignTxOverviewRow';
import { useKeysignPayload } from './state/keysignPayload';
import { extractAndFormatFees } from './utils/extractAndFormatFees';

export const KeysignTxOverview = () => {
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
  } = useKeysignPayload();

  const coin = shouldBePresent(potentialCoin);

  const { decimals } = shouldBePresent(coin);
  const coinPriceQuery = useCoinPriceQuery(CoinMeta.fromCoin(coin));

  const formattedToAmount = useMemo(() => {
    if (!toAmount || !coin) return null;
    return fromChainAmount(BigInt(toAmount), decimals || 18);
  }, [toAmount, coin, decimals]);

  const fees = extractAndFormatFees({
    blockchainSpecific,
    currency: globalCurrency,
    decimals: decimals,
  });

  const { chain } = shouldBePresent(coin);

  return (
    <VStack gap={16}>
      <HStack alignItems="center" gap={4}>
        <Text weight="600" size={20} color="contrast">
          {t('transaction')}
        </Text>
        <IconButton icon={<CopyIcon />} onClick={() => copyTxHash(txHash)} />
        <IconButton
          onClick={() => {
            const url = getBlockExplorerUrl({
              chain: chain as Chain,
              entity: 'tx',
              value: txHash,
            });
            BrowserOpenURL(url);
          }}
          icon={<LinkIcon />}
        />
      </HStack>
      <Text family="mono" color="primary" size={14} weight="400">
        {txHash}
      </Text>
      <KeysignTxOverviewRow label={t('to')} value={toAddress} />
      {memo && <KeysignTxOverviewRow label={t('memo')} value={memo} />}
      {formattedToAmount && (
        <>
          <MatchQuery
            value={coinPriceQuery}
            success={price =>
              price ? (
                <KeysignTxOverviewRow
                  label={t('value')}
                  value={formatAmount(
                    formattedToAmount * price,
                    globalCurrency
                  )}
                />
              ) : null
            }
            error={() => null}
            pending={() => null}
          />
        </>
      )}

      {fees.networkFeesFormatted && (
        <KeysignTxOverviewRow
          label={t('network_fee')}
          value={fees.networkFeesFormatted}
        />
      )}
      {fees.totalFeesFormatted && (
        <KeysignTxOverviewRow
          label={t('total_fee')}
          value={fees.totalFeesFormatted}
        />
      )}
    </VStack>
  );
};
