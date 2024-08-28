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
      '020503826804dcf347bb5c98331f10ad388fdbc935adf775154089acd89f2ce9dd';
    const thorPublicKey =
      '02bd71faf6447dd28ecc7936729c543e8de0483c9641ed65fcd4f223b010263c67';
    const thorchainSpecific = new THORChainSpecific({
      accountNumber: protoInt64.parse('1'),
      sequence: protoInt64.zero,
      fee: protoInt64.zero,
      isDeposit: false,
    });

    const keysignPayload = new KeysignPayload({
      coin: new Coin({
        chain: 'THORChain',
        ticker: 'RUNE',
        address: 'thor10stcxwypezd4pqwsdymu2p9hq90wtau6j4uljg',
        decimals: 8,
        isNativeToken: true,
        hexPublicKey: thorPublicKey,
      }),
      toAddress: 'thor1vzltn37rqccwk95tny657au9j2z072dhgstcmn',
      toAmount: '1000000',
      blockchainSpecific: {
        case: 'thorchainSpecific',
        value: thorchainSpecific,
      },
      vaultPublicKeyEcdsa: vaultHexPublicKey,
      vaultLocalPartyId: 'windows-689',
    });
    return keysignPayload;
  };

  it('should process keysign payload', async () => {
    const keysignPayload = getTestKeysignPayload();

    const blockchainService = BlockchainServiceFactory.createService(
      Chain.THORChain,
      walletCore
    );

    const result =
      await blockchainService.getPreSignedImageHash(keysignPayload);
    expect(result).toStrictEqual([
      'cac1691056905f68cec68ac322b4a067c511030996c876bd47d52fdbab34dd4a',
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
      const blockchainService = BlockchainServiceFactory.createService(
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
