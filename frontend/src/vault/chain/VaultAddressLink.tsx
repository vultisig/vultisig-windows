import { IconButton } from '../../lib/ui/buttons/IconButton';
import { BoxIcon } from '../../lib/ui/icons/BoxIcon';

import { useCurrentVaultChainId } from './useCurrentVaultChainId';
import { getBlockExplorerUrl } from '../../chain/utils/getBlockExplorerUrl';
import { BrowserOpenURL } from '../../../wailsjs/runtime';
import { ComponentWithValueProps } from '../../lib/ui/props';

export const VaultAddressLink = ({
  value,
}: ComponentWithValueProps<string>) => {
  const chainId = useCurrentVaultChainId();

  return (
    <IconButton
      onClick={() => {
        const url = getBlockExplorerUrl({
          chainId,
          entity: 'address',
          value,
        });
        BrowserOpenURL(url);
      }}
      title="Block explorer"
      icon={<BoxIcon />}
    />
  );
};
