import { describe, expect, it, vi } from 'vitest';

import { EvmChain } from '../../../../model/chain';
import { getEvmGasLimit } from '../getEvmGasLimit';

vi.mock('../evmGasLimit', () => ({
  evmNativeTokenGasLimit: {
    [EvmChain.Ethereum]: 23000,
    [EvmChain.Base]: 40000,
    [EvmChain.Arbitrum]: 120000,
    [EvmChain.Polygon]: 23000,
    [EvmChain.Optimism]: 40000,
    [EvmChain.CronosChain]: 40000,
    [EvmChain.Blast]: 40000,
    [EvmChain.BSC]: 40000,
    [EvmChain.Avalanche]: 23000,
    [EvmChain.Zksync]: 200000,
  },
  evmTokenGasLimit: {
    [EvmChain.Ethereum]: 120000,
    [EvmChain.Base]: 120000,
    [EvmChain.Arbitrum]: 120000,
    [EvmChain.Polygon]: 120000,
    [EvmChain.Optimism]: 120000,
    [EvmChain.CronosChain]: 120000,
    [EvmChain.Blast]: 120000,
    [EvmChain.BSC]: 120000,
    [EvmChain.Avalanche]: 120000,
    [EvmChain.Zksync]: 200000,
  },
}));

describe('getEvmGasLimit', () => {
  it('should return the native token gas limit for Ethereum', () => {
    const gasLimit = getEvmGasLimit({
      chain: EvmChain.Ethereum,
      isNativeToken: true,
    });
    expect(gasLimit).toBe(23000);
  });

  it('should return the token gas limit for Ethereum', () => {
    const gasLimit = getEvmGasLimit({
      chain: EvmChain.Ethereum,
      isNativeToken: false,
    });
    expect(gasLimit).toBe(120000);
  });

  it('should return the native token gas limit for Base', () => {
    const gasLimit = getEvmGasLimit({
      chain: EvmChain.Base,
      isNativeToken: true,
    });
    expect(gasLimit).toBe(40000);
  });

  it('should return the token gas limit for Base', () => {
    const gasLimit = getEvmGasLimit({
      chain: EvmChain.Base,
      isNativeToken: false,
    });
    expect(gasLimit).toBe(120000);
  });

  it('should return the native token gas limit for Arbitrum', () => {
    const gasLimit = getEvmGasLimit({
      chain: EvmChain.Arbitrum,
      isNativeToken: true,
    });
    expect(gasLimit).toBe(120000);
  });

  it('should return the token gas limit for Arbitrum', () => {
    const gasLimit = getEvmGasLimit({
      chain: EvmChain.Arbitrum,
      isNativeToken: false,
    });
    expect(gasLimit).toBe(120000);
  });

  it('should return the native token gas limit for Zksync', () => {
    const gasLimit = getEvmGasLimit({
      chain: EvmChain.Zksync,
      isNativeToken: true,
    });
    expect(gasLimit).toBe(200000);
  });

  it('should return the token gas limit for Zksync', () => {
    const gasLimit = getEvmGasLimit({
      chain: EvmChain.Zksync,
      isNativeToken: false,
    });
    expect(gasLimit).toBe(200000);
  });

  it('should return undefined if the chain ID does not exist in the record', () => {
    const gasLimit = getEvmGasLimit({
      chain: 'UNKNOWN_CHAIN' as EvmChain,
      isNativeToken: true,
    });
    expect(gasLimit).toBeUndefined();
  });
});
