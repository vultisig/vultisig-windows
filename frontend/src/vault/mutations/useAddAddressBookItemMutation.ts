import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getCoinType } from '../../chain/walletCore/getCoinType';
import { AddressBookItem } from '../../lib/types/address-book';
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

      const coinType = getCoinType({
        walletCore,
        chain,
      });

      const isValidAddress = walletCore.AnyAddress.isValid(address, coinType);

      if (!isValidAddress) {
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
