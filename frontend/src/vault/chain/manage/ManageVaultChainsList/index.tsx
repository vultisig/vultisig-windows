import { useMemo } from 'react';

import { useCurrentSearch } from '../../../../lib/ui/search/CurrentSearchProvider';
import { Chain } from '../../../../model/chain';
import { ManageVaultChain } from '../ManageVaultChain';

const ManageVaultChainsList = () => {
  const [searchQuery] = useCurrentSearch();

  const filteredChains = useMemo(() => {
    return Object.values(Chain).filter(chain =>
      chain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <>
      {filteredChains.map(chain => (
        <ManageVaultChain key={chain} value={chain} />
      ))}
    </>
  );
};

export default ManageVaultChainsList;
