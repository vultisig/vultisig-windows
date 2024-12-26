import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isValidAddress } from '../../chain/utils/isValidAddress';
import { AddressBookItem } from '../../lib/types/address-book';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultService } from '../../services/Vault/VaultService';
import {
  addressBookItemsQueryKey,
  useAddressBookItemsQuery,
} from '../queries/useAddressBookItemsQuery';

export const useAddAddressBookItemMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) => {
  const queryClient = useQueryClient();
  const walletCore = useAssertWalletCore();
  const vaultService = new VaultService();
  const { data: addressBookItems } = useAddressBookItemsQuery();

  return useMutation({
    mutationFn: async (addressBookItem: Omit<AddressBookItem, 'id'>) => {
      const { address, chain } = addressBookItem;

      const isValid = isValidAddress({
        chain: chain as Chain,
        address,
        walletCore,
      });

      if (!isValid) {
        throw new Error('vault_settings_address_book_invalid_address_error');
      }

      const isAddressAlreadyAdded = addressBookItems.some(
        item => item.address === addressBookItem.address
      );

      if (isAddressAlreadyAdded) {
        throw new Error('vault_settings_address_book_repeated_address_error');
      }

      return await vaultService.saveAddressBookItem(addressBookItem);
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
