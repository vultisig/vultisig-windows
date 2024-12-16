import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Center } from '../lib/ui/layout/Center';
import { ComponentWithChildrenProps } from '../lib/ui/props';
import { MatchQuery } from '../lib/ui/query/components/MatchQuery';
import { mergeQueries } from '../lib/ui/query/utils/mergeQueries';
import { StrictText } from '../lib/ui/text';
import { ProductLogoBlock } from '../ui/logo/ProductLogoBlock';
import { useVaultsQuery } from '../vault/queries/useVaultsQuery';
import { useVaultFoldersQuery } from '../vaults/folders/queries/useVaultFoldersQuery';

export const RemoteStateDependant = ({
  children,
}: ComponentWithChildrenProps) => {
  const vaults = useVaultsQuery();
  const vaultFolders = useVaultFoldersQuery();

  const query = useMemo(
    () => mergeQueries({ vaults, vaultFolders }),
    [vaultFolders, vaults]
  );

  const { t } = useTranslation();

  return (
    <MatchQuery
      value={query}
      success={() => children}
      error={() => (
        <Center>
          <StrictText>{t('failed_to_load')}</StrictText>
        </Center>
      )}
      pending={() => <ProductLogoBlock />}
    />
  );
};
