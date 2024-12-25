import { TW } from '@trustwallet/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import {
  SuiCoin,
  SuiSpecific,
} from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../../model/chain';
import { SpecificSui } from '../../../model/specific-transaction-info';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';
import { SignedTransactionResult } from '../signed-transaction-result';

export class BlockchainServiceSui
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
    const specific_pb = new SuiSpecific();
    const transactionInfoSpecific: SpecificSui =
      obj.specificTransactionInfo as SpecificSui;

    switch (obj.transactionType) {
      case TransactionType.SEND:
        specific_pb.coins = transactionInfoSpecific.coins || [];
        specific_pb.referenceGasPrice =
          transactionInfoSpecific.referenceGasPrice.toString();

        payload.blockchainSpecific = {
          case: 'suicheSpecific',
          value: specific_pb,
        };
        break;

      case TransactionType.SWAP:
        payload.blockchainSpecific = {
          case: 'suicheSpecific',
          value: specific_pb,
        };
        break;

      default:
        throw new Error(`Unsupported transaction type: ${obj.transactionType}`);
    }

    return payload;
  }

  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    if (keysignPayload.coin?.chain !== Chain.Sui) {
      console.error('Coin is not Sui');
      console.error('keysignPayload.coin?.chain:', keysignPayload.coin?.chain);
    }

    const suiSpecific = keysignPayload.blockchainSpecific.value as SuiSpecific;
    if (!suiSpecific) {
      console.error(
        'getPreSignedInputData fail to get SUI transaction information from RPC'
      );
    }

    const { coins, referenceGasPrice } = suiSpecific;

    const inputData = TW.Sui.Proto.SigningInput.create({
      referenceGasPrice: Long.fromString(referenceGasPrice),
      signer: keysignPayload.coin?.address,
      gasBudget: Long.fromString('3000000'),

      paySui: TW.Sui.Proto.PaySui.create({
        inputCoins: coins.map((coin: SuiCoin) => {
          const obj = TW.Sui.Proto.ObjectRef.create({
            objectDigest: coin.digest,
            objectId: coin.coinObjectId,
            version: Long.fromString(coin.version),
          });
          return obj;
        }),
        recipients: [keysignPayload.toAddress],
        amounts: [Long.fromString(keysignPayload.toAmount)],
      }),
    });

    const input = TW.Sui.Proto.SigningInput.encode(inputData).finish();
    return input;
  }

  public async getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const publicKey = await this.addressService.getPublicKey(
      '',
      vaultHexPublicKey,
      vaultHexChainCode
    );
    const publicKeyData = publicKey.data();

    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );

    const [dataHash] = getPreSigningHashes({
      walletCore: this.walletCore,
      txInputData,
      chain: this.chain,
    });

    const signature = signatureProvider.getSignature(dataHash);

    if (!publicKey.verify(signature, dataHash)) {
      console.error('Failed to verify signature');
      throw new Error('Failed to verify signature');
    }

    allSignatures.add(signature);
    publicKeys.add(publicKeyData);

    const compiled = this.walletCore.TransactionCompiler.compileWithSignatures(
      this.coinType,
      txInputData,
      allSignatures,
      publicKeys
    );

    const output = TW.Sui.Proto.SigningOutput.decode(compiled);
    if (output.errorMessage !== '') {
      console.error('output error:', output.errorMessage);
      throw new Error(output.errorMessage);
    }

    const result = new SignedTransactionResult(
      output.unsignedTx,
      '',
      output.signature
    );

    return result;
  }
}
