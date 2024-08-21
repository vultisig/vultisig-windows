import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { CurrentVaultProvider } from '../../vault/components/CurrentVaultProvider';
import { CurrentVaultsProvider } from '../../vault/components/CurrentVaultsProvider';
import { useVaultsQuery } from '../../vault/queries/useVaultsQuery';
import { VaultPageContent } from './VaultPageContent';

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
          <CurrentVaultsProvider value={vaults}>
            <CurrentVaultProvider initialValue={vaults[0]}>
              <VaultPageContent />
            </CurrentVaultProvider>
          </CurrentVaultsProvider>
        );
      }}
    />
  );
};
