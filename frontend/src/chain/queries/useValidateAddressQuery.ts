import { useQuery } from '@tanstack/react-query';

import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { ChainAccount } from '../ChainAccount';
import { getCoinType } from '../walletCore/getCoinType';

export const useValidateAddressQuery = ({ chain, address }: ChainAccount) => {
  const walletCore = useAssertWalletCore();

  return useQuery({
    queryKey: ['validateAddress', chain, address],
    queryFn: async () => {
      const coinType = getCoinType({
        walletCore,
        chain,
      });

      const isValid = walletCore.AnyAddress.isValid(address, coinType);

      return isValid ? null : 'Invalid address';
    },
  });
};
