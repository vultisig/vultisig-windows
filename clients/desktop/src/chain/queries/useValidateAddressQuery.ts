import { ChainAccount } from '@core/chain/ChainAccount';
import { useQuery } from '@tanstack/react-query';

import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { isValidAddress } from '../utils/isValidAddress';

export const useValidateAddressQuery = ({ chain, address }: ChainAccount) => {
  const walletCore = useAssertWalletCore();

  return useQuery({
    queryKey: ['validateAddress', chain, address],
    queryFn: async () => {
      const isValid = isValidAddress({
        chain,
        address,
        walletCore,
      });

      return isValid ? null : 'Invalid address';
    },
  });
};
