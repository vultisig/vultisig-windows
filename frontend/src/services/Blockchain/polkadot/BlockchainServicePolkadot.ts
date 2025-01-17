import { TW } from '@trustwallet/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../../model/chain';
import { IBlockchainService } from '../IBlockchainService';
import TxCompiler = TW.TxCompiler;
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import Long from 'long';

import { getBlockchainSpecificValue } from '../../../chain/keysign/KeysignChainSpecific';
import { callRpc } from '../../../chain/rpc/callRpc';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { bigIntToHex } from '../../../chain/utils/bigIntToHex';
import { stripHexPrefix } from '../../../chain/utils/stripHexPrefix';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { Endpoint } from '../../Endpoint';
import { BlockchainService } from '../BlockchainService';
import SignatureProvider from '../signature-provider';

export class BlockchainServicePolkadot
  extends BlockchainService
  implements IBlockchainService
{
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    if (keysignPayload.coin?.chain !== Chain.Polkadot) {
      console.error('Coin is not Polkadot');
      console.error('keysignPayload.coin?.chain:', keysignPayload.coin?.chain);
    }

    const polkadotSpecific = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'polkadotSpecific'
    );

    const {
      recentBlockHash,
      nonce,
      currentBlockNumber,
      specVersion,
      transactionVersion,
      genesisHash,
    } = polkadotSpecific;

    try {
      // Amount: converted to hexadecimal, stripped of '0x'
      const amountHex = Buffer.from(
        stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
        'hex'
      );

      const t = TW.Polkadot.Proto.Balance.Transfer.create({
        toAddress: keysignPayload.toAddress,
        value: new Uint8Array(amountHex),
        memo: keysignPayload.memo || '',
      });

      const balance = TW.Polkadot.Proto.Balance.create({
        transfer: t,
      });

      const nonceLong =
        nonce == BigInt(0) ? Long.ZERO : Long.fromString(nonce.toString());
      const currentBlockNumberLong = Long.fromString(currentBlockNumber);
      const periodLong = Long.fromString('64');

      const era = TW.Polkadot.Proto.Era.create({
        blockNumber: currentBlockNumberLong,
        period: periodLong,
      });

      const ss58Prefix = this.walletCore.CoinTypeExt.ss58Prefix(this.coinType);
      const input = TW.Polkadot.Proto.SigningInput.create({
        genesisHash: this.hexToBytes(genesisHash),
        blockHash: this.hexToBytes(recentBlockHash),
        nonce: nonceLong,
        specVersion: specVersion,
        transactionVersion: transactionVersion,
        network: ss58Prefix,
        era: era,
        balanceCall: balance,
      });

      return TW.Polkadot.Proto.SigningInput.encode(input).finish();
    } catch (e) {
      console.error('Error in getPreSignedInputData:', e);
      throw e;
    }
  }

  // Helper function to convert hex string to Uint8Array
  hexToBytes(hex: string): Uint8Array {
    hex = hex.startsWith('0x') ? hex.slice(2) : hex;
    return new Uint8Array(Buffer.from(hex, 'hex'));
  }

  public async executeTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<string> {
    const publicKeyData = publicKey.data();

    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      txInputData
    );

    const { data, errorMessage } =
      TxCompiler.Proto.PreSigningOutput.decode(preHashes);

    assertErrorMessage(errorMessage);

    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );
    const signature = signatureProvider.getSignature(data);

    assertSignature({
      publicKey,
      message: data,
      signature,
    });

    allSignatures.add(signature);
    publicKeys.add(publicKeyData);

    const compiled = this.walletCore.TransactionCompiler.compileWithSignatures(
      this.coinType,
      txInputData,
      allSignatures,
      publicKeys
    );

    const { errorMessage: polkadotErrorMessage, encoded } =
      TW.Polkadot.Proto.SigningOutput.decode(compiled);

    assertErrorMessage(polkadotErrorMessage);

    const rawTx = this.walletCore.HexCoding.encode(encoded);

    return callRpc({
      url: Endpoint.polkadotServiceRpc,
      method: 'author_submitExtrinsic',
      params: [rawTx],
    });
  }
}
