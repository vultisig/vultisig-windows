import { WalletCore } from '@trustwallet/wallet-core';
import { describe, expect, it, vi } from 'vitest';

import { Chain } from '../../../../model/chain';
import { AddressServiceFactory } from '../../../../services/Address/AddressServiceFactory';
import { validateNodeAddress } from '.';

vi.mock('../../../../services/Address/AddressServiceFactory', () => ({
  AddressServiceFactory: {
    createAddressService: vi.fn(),
  },
}));

describe('validateNodeAddress', () => {
  it('returns true for a valid node address', async () => {
    const mockValidateAddress = vi.fn().mockResolvedValue(true);
    AddressServiceFactory.createAddressService = vi.fn().mockReturnValue({
      validateAddress: mockValidateAddress,
    });

    const mockWalletCore = {} as WalletCore; // Mock WalletCore
    const mockChainId = 'mockChainId' as unknown as Chain; // Mock Chain
    const result = await validateNodeAddress(
      'validAddress',
      mockChainId,
      mockWalletCore
    );

    expect(result).toBe(true);
    expect(AddressServiceFactory.createAddressService).toHaveBeenCalledWith(
      mockChainId,
      mockWalletCore
    );
    expect(mockValidateAddress).toHaveBeenCalledWith('validAddress');
  });

  it('returns false for an invalid node address', async () => {
    const mockValidateAddress = vi.fn().mockResolvedValue(false);
    AddressServiceFactory.createAddressService = vi.fn().mockReturnValue({
      validateAddress: mockValidateAddress,
    });

    const mockWalletCore = {} as WalletCore;
    const mockChainId = 'mockChainId' as unknown as Chain;
    const result = await validateNodeAddress(
      'invalidAddress',
      mockChainId,
      mockWalletCore
    );

    expect(result).toBe(false);
    expect(AddressServiceFactory.createAddressService).toHaveBeenCalledWith(
      mockChainId,
      mockWalletCore
    );
    expect(mockValidateAddress).toHaveBeenCalledWith('invalidAddress');
  });
});
