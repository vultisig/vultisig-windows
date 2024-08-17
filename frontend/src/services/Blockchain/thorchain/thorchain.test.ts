import { describe, it, beforeAll, expect, vi } from 'vitest';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { THORChainSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { protoInt64 } from '@bufbuild/protobuf';
import { tss } from '../../../../wailsjs/go/models';
import { BlockchainServiceFactory } from '../BlockchainServiceFactory';
import { Chain } from '../../../model/chain';
import { initWasm, WalletCore } from '@trustwallet/wallet-core';

// Mock the AddressServiceFactory and the AddressService
vi.mock('../../Address/AddressServiceFactory', () => {
  return {
    AddressServiceFactory: {
      createAddressService: vi.fn().mockImplementation(() => {
        return {
          getDerivedPubKey: vi
            .fn()
            .mockImplementation(
              async (vaultHexPublicKey, vaultHexChainCode, derivationPath) => {
                console.log('mocked getDerivedPubKey');
                console.log('vaultHexPublicKey', vaultHexPublicKey);
                console.log('vaultHexChainCode', vaultHexChainCode);
                console.log('derivationPath', derivationPath);
                return '0204fa2732a07d65222b9484c45d7f32319498d0ea8748e198ef2c9001f8db3d91';
              }
            ),
        };
      }),
    },
  };
});

describe('thorchain.ts', () => {
  let walletCore: WalletCore;

  beforeAll(async () => {
    console.log('beforeAll');
    global.window = {} as any;

    walletCore = await initWasm();
  });

  const getTestKeysignPayload = () => {
    const vaultHexPublicKey =
      '02d2142480ff0461b4755574e760f06abec0b9bfbe1112137627e031cc085f60c7';
    const thorPublicKey =
      '0204fa2732a07d65222b9484c45d7f32319498d0ea8748e198ef2c9001f8db3d91';
    const thorchainSpecific = new THORChainSpecific({
      accountNumber: protoInt64.parse('1024'),
      sequence: protoInt64.zero,
    });

    const keysignPayload = new KeysignPayload({
      coin: new Coin({
        chain: 'THORChain',
        ticker: 'RUNE',
        address: 'thor1jnwfjsytm8j79s66et35etv542q7eyah807gk5',
        decimals: 8,
        isNativeToken: true,
        hexPublicKey: thorPublicKey,
      }),
      toAddress: 'thor1jnwfjsytm8j79s66et35etv542q7eyah807gk5',
      toAmount: '100000000',
      blockchainSpecific: {
        case: 'thorchainSpecific',
        value: thorchainSpecific,
      },
      vaultPublicKeyEcdsa: vaultHexPublicKey,
      vaultLocalPartyId: 'test-party',
    });
    return keysignPayload;
  };

  it('should process keysign payload', async () => {
    const keysignPayload = getTestKeysignPayload();

    const blockchainService = BlockchainServiceFactory.createAddressService(
      Chain.THORChain,
      walletCore
    );

    const result =
      await blockchainService.getPreSignedImageHash(keysignPayload);
    expect(result).toStrictEqual([
      '4a4dfce117748df028592b46bc9af7e48e6f5b4ae26d3e5b77d9677b521908e1',
    ]);
    console.log('result', result);
  });

  it('should get signed transaction', async () => {
    const keysignPayload = getTestKeysignPayload();
    const vaultHexChainCode =
      '5caa3c81e522b370696d19a54479507f5b6ce2aa81ba23219f40f42433bd42c1';
    const signatures1: { [key: string]: tss.KeysignResponse } = {
      // Populate with appropriate data
    };

    await expect(async () => {
      const blockchainService = BlockchainServiceFactory.createAddressService(
        Chain.THORChain,
        walletCore
      );
      const result = await blockchainService.getSignedTransaction(
        keysignPayload.vaultPublicKeyEcdsa,
        vaultHexChainCode,
        keysignPayload,
        signatures1
      );
      console.log('result', result);
    }).rejects.toThrow('Invalid signature');
  });
});
export {};
