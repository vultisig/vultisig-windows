import { IconButton } from '../../lib/ui/buttons/IconButton';
import { BoxIcon } from '../../lib/ui/icons/BoxIcon';

import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { useVaultAddressQuery } from '../queries/useVaultAddressQuery';
import { useCurrentVaultChainId } from './useCurrentVaultChainId';
import { getBlockExplorerUrl } from '../../chain/utils/getBlockExplorerUrl';
import { BrowserOpenURL } from '../../../wailsjs/runtime';

export const VaultAddressLink = () => {
  const chainId = useCurrentVaultChainId();

  const vaultAddressQuery = useVaultAddressQuery(chainId);

  return (
    <QueryDependant
      query={vaultAddressQuery}
      success={value => (
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
      )}
      error={() => null}
      pending={() => null}
    />
  );
};
