import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AddressBookItem } from '../../lib/types/address-book';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { AddressServiceFactory } from '../../services/Address/AddressServiceFactory';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';
import { addressBookItemsQueryKey } from '../queries/useAddressBookItemsQuery';

export const useUpdateAddressBookItemMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) => {
  const queryClient = useQueryClient();
  const walletCore = useAssertWalletCore();
  const vaultService = VaultServiceFactory.getService(walletCore);

  return useMutation({
    mutationFn: async ({
      addressBookItem,
      chain,
    }: {
      addressBookItem: AddressBookItem;
      chain: Chain;
    }) => {
      const addressService = AddressServiceFactory.createAddressService(
        chain,
        walletCore
      );

      const isValidAddress = await addressService.validateAddress(
        addressBookItem.address
      );

      if (!isValidAddress) {
        throw new Error('Invalid address for the selected chain!');
      }

      return await vaultService.updateAddressBookItem(addressBookItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [addressBookItemsQueryKey],
        refetchType: 'all',
      });

      onSuccess?.();
    },
  });
};
