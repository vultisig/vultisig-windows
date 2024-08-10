import { describe, it, beforeAll } from 'vitest';
import { Coin } from '../gen/vultisig/keysign/v1/coin_pb';
import { KeysignPayload } from '../gen/vultisig/keysign/v1/keysign_message_pb';
import THORChainHelper from './thorchain';
import { initWasm } from '@trustwallet/wallet-core';
import { THORChainSpecific } from '../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { protoInt64 } from '@bufbuild/protobuf';

describe('thorchain.ts', () => {
  beforeAll(async () => {
    console.log('beforeAll');
    global.window = {} as any;
  });
  it('should process keysign payload', async () => {
    const vaultHexPublicKey =
      '02d2142480ff0461b4755574e760f06abec0b9bfbe1112137627e031cc085f60c7';
    // const vaultHexChainCode =
    //   '5caa3c81e522b370696d19a54479507f5b6ce2aa81ba23219f40f42433bd42c1';
    const thorPublicKey = '';
    const thorchainSpecific = new THORChainSpecific({
      accountNumber: protoInt64.zero,
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

    const result = new THORChainHelper(await initWasm()).getPreSignedImageHash(
      keysignPayload
    );
    console.log('result', result);
  });
});
export {};
