import { useTranslation } from 'react-i18next';

import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';
import { useCurrentTxHash } from '../../../chain/state/currentTxHash';
import { useCopyTxHash } from '../../../chain/ui/hooks/useCopyTxHash';
import { getBlockExplorerUrl } from '../../../chain/utils/getBlockExplorerUrl';
import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { CopyIcon } from '../../../lib/ui/icons/CopyIcon';
import { LinkIcon } from '../../../lib/ui/icons/LinkIcon';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../../model/chain';
import { useKeysignPayload } from './state/keysignPayload';

export const KeysignTxOverview = () => {
  const txHash = useCurrentTxHash();

  const { t } = useTranslation();

  const copyTxHash = useCopyTxHash();

  const { coin } = useKeysignPayload();
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
    </VStack>
  );
};
