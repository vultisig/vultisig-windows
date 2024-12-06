import { WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../../../../model/chain';
import { AddressServiceFactory } from '../../../../services/Address/AddressServiceFactory';

export async function validateNodeAddress(
  nodeAddress: string,
  chain: Chain,
  walletCore: WalletCore
): Promise<boolean> {
  const addressService = AddressServiceFactory.createAddressService(
    chain,
    walletCore
  );
  const isValid = await addressService.validateAddress(nodeAddress);
  return isValid;
}
