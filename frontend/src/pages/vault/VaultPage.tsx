import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { CurrentVaultProvider } from '../../vault/components/CurrentVaultProvider';
import { useVaultsQuery } from '../../vault/queries/useVaultsQuery';
import VaultListView from './VaultListView';

export const VaultPage = () => {
  const vaultsQuery = useVaultsQuery();

  return (
    <QueryDependant
      query={vaultsQuery}
      {...getQueryDependantDefaultProps('vaults')}
      success={vaults => {
        // TODO: handle situation when there are no vaults
        if (vaults.length === 0) {
          return <div>No vaults found</div>;
        }

        return (
          <CurrentVaultProvider initialValue={vaults[0]}>
            <VaultListView />
          </CurrentVaultProvider>
        );
      }}
    />
  );
};
