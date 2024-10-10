import { useQuery } from '@tanstack/react-query';

import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { AddressServiceFactory } from '../../services/Address/AddressServiceFactory';
import { ChainAccount } from '../ChainAccount';

export const useValidateAddressQuery = ({ chainId, address }: ChainAccount) => {
  const walletCore = useAssertWalletCore();

  return useQuery({
    queryKey: ['validateAddress', chainId, address],
    queryFn: async () => {
      const addressService = AddressServiceFactory.createAddressService(
        chainId,
        walletCore
      );

      const isValid = await addressService.validateAddress(address);

      return isValid ? null : 'Invalid address';
    },
  });
};
