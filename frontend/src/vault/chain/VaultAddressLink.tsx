import { BrowserOpenURL } from '../../../wailsjs/runtime';
import { getBlockExplorerUrl } from '../../chain/utils/getBlockExplorerUrl';
import { IconButton } from '../../lib/ui/buttons/IconButton';
import { BoxIcon } from '../../lib/ui/icons/BoxIcon';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { useCurrentVaultChainId } from './useCurrentVaultChainId';

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
