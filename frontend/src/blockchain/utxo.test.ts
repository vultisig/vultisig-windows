import { assert, describe, it, vi } from 'vitest';
import { UTXOSpecific } from '../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '../gen/vultisig/keysign/v1/coin_pb';
import { KeysignPayload } from '../gen/vultisig/keysign/v1/keysign_message_pb';
import { UtxoInfo } from '../gen/vultisig/keysign/v1/utxo_info_pb';
import { protoInt64 } from '@bufbuild/protobuf';
import { UTXOHelper } from './utxo';
import { initWasm } from '@trustwallet/wallet-core';
import { Vault } from '../gen/vultisig/vault/v1/vault_pb';
import '../extensions/string';

vi.mock('./public-key-helper', () => {
  return {
    default: {
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
    },
  };
});

describe('utxo.ts', () => {
  const getTestKeysignPayload = () => {
    const vaultHexPublicKey =
      '0318f2e16e18a6bd6ec1cb5d51aef261f628caf83e80c4bb6a867e2b2dc899721a';
    const dogeCoinPublicKey =
      '02af60280f7fb422f90e7876f00ac90627b735846bad4b845fc75bb37ed4145362';
    const utxoSpecific = new UTXOSpecific({
      byteFee: '1',
    });

    const keysignPayload = new KeysignPayload({
      coin: new Coin({
        chain: 'Dogecoin',
        ticker: 'DOGE',
        address: 'D9dBJfj93Z2mZ5XfG5K2i5MVoVfYZtBcgQ',
        decimals: 8,
        isNativeToken: true,
        hexPublicKey: dogeCoinPublicKey,
      }),
      toAddress: 'DLdSt5pUsBbMrMAQj99dgtkauzsstL4SXA',
      toAmount: '100000000',
      blockchainSpecific: {
        case: 'utxoSpecific',
        value: utxoSpecific,
      },
      vaultPublicKeyEcdsa: vaultHexPublicKey,
      vaultLocalPartyId: 'test-party',
    });
    keysignPayload.utxoInfo = [
      new UtxoInfo({
        hash: 'b9e6c7057da0c16e41c74c9e6158e0466d4aee3acd12914541baf3325e02a808',
        index: 1,
        amount: protoInt64.parse('814560933'),
      }),
    ];
    return keysignPayload;
  };
  it('it should process keysign payload', async () => {
    const walletCore = await initWasm();
    const keysignPayload = getTestKeysignPayload();
    const vault = new Vault({
      publicKeyEcdsa:
        '0318f2e16e18a6bd6ec1cb5d51aef261f628caf83e80c4bb6a867e2b2dc899721a',
      publicKeyEddsa:
        'ef552ab64acc0082055a582b64f95306b378cea266f6564f1a701295a91e2128',
      hexChainCode:
        '857d3806d89f40456e08922107cf5855c4a35c68f427b906828da50093b6767d',
    });

    assert(keysignPayload.coin !== undefined);
    const utxoHelper = UTXOHelper.getHelper(
      walletCore,
      keysignPayload.coin,
      vault
    );
    assert(utxoHelper !== undefined);
    const result = utxoHelper.getPreSignedImageHash(keysignPayload);
    assert(result !== undefined);
  });
});
