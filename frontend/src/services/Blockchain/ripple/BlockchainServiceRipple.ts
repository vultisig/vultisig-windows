/* eslint-disable */
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { IBlockchainService } from '../IBlockchainService';
import { RippleSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { BlockchainService } from '../BlockchainService';
import { TW } from '@trustwallet/wallet-core';
import { SpecificRipple } from '../../../model/specific-transaction-info';
import { stripHexPrefix } from '../../../chain/utils/stripHexPrefix';
import TxCompiler = TW.TxCompiler;
import { Chain } from '../../../model/chain';
import Long from 'long';

export class BlockchainServiceRipple
  extends BlockchainService
  implements IBlockchainService
{
  createKeysignPayload(
    obj: ITransaction | ISendTransaction | ISwapTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload {
    const payload: KeysignPayload = super.createKeysignPayload(
      obj,
      localPartyId,
      publicKeyEcdsa
    );
    const rippleSpecific = new RippleSpecific();
    const transactionInfoSpecific: SpecificRipple =
      obj.specificTransactionInfo as SpecificRipple;
    switch (obj.transactionType) {
      case TransactionType.SEND:
        rippleSpecific.gas = BigInt(transactionInfoSpecific?.gasPrice || 0);
        rippleSpecific.sequence = BigInt(
          transactionInfoSpecific?.sequence || 0
        );

        payload.blockchainSpecific = {
          case: 'rippleSpecific',
          value: rippleSpecific,
        };
        break;

      // We will have to check how the swap-old transaction is structured for UTXO chains
      case TransactionType.SWAP:
        const swapTx = obj as ISwapTransaction;
        payload.blockchainSpecific = {
          case: 'rippleSpecific',
          value: rippleSpecific,
        };
        break;

      default:
        throw new Error(`Unsupported transaction type: ${obj.transactionType}`);
    }

    return payload;
  }

  isTHORChainSpecific(obj: any): boolean {
    console.error('Method not implemented.', obj);
    throw new Error('Method not implemented.');
  }

  getSwapPreSignedInputData(
    keysignPayload: KeysignPayload,
    signingInput: any
  ): Uint8Array {
    console.error('Method not implemented.', keysignPayload, signingInput);
    throw new Error('Method not implemented.');
  }

  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const walletCore = this.walletCore;

    if (keysignPayload.coin?.chain !== Chain.Ripple) {
      console.error('Coin is not Ripple');
      console.error('keysignPayload.coin?.chain:', keysignPayload.coin?.chain);
    }

    const transactionInfoSpecific: SpecificRipple =
      keysignPayload.blockchainSpecific as unknown as SpecificRipple;

    if (!transactionInfoSpecific) {
      console.error(
        'getPreSignedInputData fail to get Ripple transaction information from RPC'
      );
    }

    if (!keysignPayload.coin) {
      throw new Error('keysignPayload.coin is undefined');
    }

    const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }

    const toAddress = walletCore.AnyAddress.createWithString(
      keysignPayload.toAddress,
      this.coinType
    );

    if (!toAddress) {
      throw new Error('invalid to address');
    }

    const { fee, sequence } = transactionInfoSpecific;

    try {
      const input = TW.Ripple.Proto.SigningInput.create({
        account: keysignPayload.coin.address,
        fee: Long.fromString(fee.toString()),
        sequence: sequence,
        publicKey: pubKeyData,
        opPayment: TW.Ripple.Proto.OperationPayment.create({
          destination: keysignPayload.toAddress,
          amount: Long.fromString(keysignPayload.toAmount),
          destinationTag: keysignPayload.memo
            ? Long.fromString(keysignPayload.memo)
            : undefined,
        }),
      });

      return TW.Ripple.Proto.SigningInput.encode(input).finish();
    } catch (e) {
      console.error('Error in getPreSignedInputData:', e);
      throw e;
    }
  }

  async getPreSignedImageHash(
    keysignPayload: KeysignPayload
  ): Promise<string[]> {
    try {
      const walletCore = this.walletCore;
      const coinType = walletCore.CoinType.xrp;
      const inputData = await this.getPreSignedInputData(keysignPayload);
      const hashes = walletCore.TransactionCompiler.preImageHashes(
        coinType,
        inputData
      );
      const preSigningOutput = TxCompiler.Proto.PreSigningOutput.decode(hashes);
      if (preSigningOutput.errorMessage !== '') {
        console.error('preSigningOutput error:', preSigningOutput.errorMessage);
        throw new Error(preSigningOutput.errorMessage);
      }

      return [
        stripHexPrefix(walletCore.HexCoding.encode(preSigningOutput.dataHash)),
      ];
    } catch (error) {
      console.error('getPreSignedImageHash::', error);
      return [];
    }
  }
}
