import { useTranslation } from 'react-i18next';

import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';
import { useCurrentTxHash } from '../../../chain/state/currentTxHash';
import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { useCopyTxHash } from '../../../chain/ui/hooks/useCopyTxHash';
import { getBlockExplorerUrl } from '../../../chain/utils/getBlockExplorerUrl';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { CopyIcon } from '../../../lib/ui/icons/CopyIcon';
import { LinkIcon } from '../../../lib/ui/icons/LinkIcon';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { calculateFromChainToHumanReadableAmount } from '../../../lib/utils/calculateFromChainToHumanReadableAmount';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { Chain } from '../../../model/chain';
import { useAppPathState } from '../../../navigation/hooks/useAppPathState';
import { useKeysignPayload } from './state/keysignPayload';

const Section = ({
  label,
  value,
  isMono,
}: {
  label: string;
  value?: string;
  isMono?: boolean;
}) =>
  value ? (
    <VStack gap={16}>
      <HStack alignItems="center" gap={4}>
        <Text weight="600" size={20} color="contrast">
          {label}
        </Text>
      </HStack>
      <Text
        family={isMono ? 'mono' : 'regular'}
        color="primary"
        size={14}
        weight="400"
      >
        {value}
      </Text>
    </VStack>
  ) : null;

export const KeysignTxOverview = () => {
  const { t } = useTranslation();
  const { coin, toAddress, memo, toAmount } = useKeysignPayload();
  const { fees } = useAppPathState<'keysign'>();
  const txHash = useCurrentTxHash();
  const copyTxHash = useCopyTxHash();
  const { chain } = shouldBePresent(coin);
  const { globalCurrency } = useGlobalCurrency();
  let amount = toAmount;

  if (chain && coin?.chain) {
    const { decimals } = getChainFeeCoin(coin?.chain as Chain);
    const rawAmount = calculateFromChainToHumanReadableAmount({
      amount: toAmount,
      decimals,
    });
    amount = formatAmount(rawAmount, globalCurrency);
  }

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
      <Section label={t('to')} value={toAddress} isMono />
      <Section label={t('memo')} value={memo} isMono />
      <Section label={t('value')} value={String(amount)} isMono />
      {fees?.type === 'send' && (
        <Section
          label={t('network_fee')}
          value={fees.networkFeesFormatted}
          isMono
        />
      )}
      <Section label={t('total_fee')} value={fees?.totalFeesFormatted} isMono />
    </VStack>
  );
};
