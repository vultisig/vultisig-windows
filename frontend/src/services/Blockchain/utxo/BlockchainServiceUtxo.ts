/* eslint-disable */
import { tss } from '../../../../wailsjs/go/models';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { IBlockchainService } from '../IBlockchainService';
import { SignedTransactionResult } from '../signed-transaction-result';
import { UTXOSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { BlockchainService } from '../BlockchainService';
import SignatureProvider from '../signature-provider';
import { TW } from '@trustwallet/wallet-core';
import Long from 'long';
import { SpecificUtxo } from '../../../model/specific-transaction-info';
import { UtxoInfo } from '../../../gen/vultisig/keysign/v1/utxo_info_pb';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';

export class BlockchainServiceUtxo
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
    const utxoSpecific = new UTXOSpecific();
    const transactionInfoSpecific: SpecificUtxo =
      obj.specificTransactionInfo as SpecificUtxo;
    switch (obj.transactionType) {
      case TransactionType.SEND:
        const sendTx = obj as ISendTransaction;
        utxoSpecific.sendMaxAmount = sendTx.sendMaxAmount;
        utxoSpecific.byteFee = transactionInfoSpecific.byteFee.toString() ?? '';

        payload.utxoInfo = transactionInfoSpecific.utxos.map(utxo => {
          return new UtxoInfo({
            hash: utxo.hash,
            amount: utxo.amount,
            index: utxo.index,
          });
        });

        payload.blockchainSpecific = {
          case: 'utxoSpecific',
          value: utxoSpecific,
        };
        break;

      // We will have to check how the swap-old transaction is structured for UTXO chains
      case TransactionType.SWAP:
        const swapTx = obj as ISwapTransaction;
        payload.blockchainSpecific = {
          case: 'utxoSpecific',
          value: utxoSpecific,
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
    const input = this.getBitcoinSigningInput(keysignPayload);
    const inputData = TW.Bitcoin.Proto.SigningInput.encode(input).finish();
    const plan = this.walletCore.AnySigner.plan(inputData, this.coinType);
    input.plan = TW.Bitcoin.Proto.TransactionPlan.decode(plan);
    return TW.Bitcoin.Proto.SigningInput.encode(input).finish();
  }

  public async getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    data: KeysignPayload | Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    let inputData: Uint8Array;
    if (data instanceof Uint8Array) {
      inputData = data;
    } else {
      inputData = await this.getPreSignedInputData(data);
    }
    const utxoPublicKey = await this.addressService.getDerivedPubKey(
      vaultHexPublicKey,
      vaultHexChainCode,
      this.walletCore.CoinTypeExt.derivationPath(this.coinType)
    );
    const publicKeyData = Buffer.from(utxoPublicKey, 'hex');
    const publicKey = this.walletCore.PublicKey.createWithData(
      publicKeyData,
      this.walletCore.PublicKeyType.secp256k1
    );
    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      inputData
    );
    const preSignOutputs = TW.Bitcoin.Proto.PreSigningOutput.decode(preHashes);
    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );
    for (const hash of preSignOutputs.hashPublicKeys) {
      if (
        hash === undefined ||
        hash.dataHash === undefined ||
        hash.dataHash === null
      ) {
        continue;
      }
      const preImageHash = hash.dataHash;
      const signature = signatureProvider.getDerSignature(preImageHash);
      if (signature === undefined) {
        continue;
      }
      if (!publicKey.verifyAsDER(signature, preImageHash)) {
        throw new Error('fail to verify signature');
      }
      allSignatures.add(signature);
      publicKeys.add(publicKeyData);
    }
    const compileWithSignatures =
      this.walletCore.TransactionCompiler.compileWithSignatures(
        this.coinType,
        inputData,
        allSignatures,
        publicKeys
      );
    const output = TW.Bitcoin.Proto.SigningOutput.decode(compileWithSignatures);
    const result = new SignedTransactionResult(
      hexEncode({
        value: output.encoded,
        walletCore: this.walletCore,
      }),
      output.transactionId
    );
    return result;
  }

  // private methods
  getBitcoinSigningInput(
    keysignPayload: KeysignPayload
  ): TW.Bitcoin.Proto.SigningInput {
    if (keysignPayload.blockchainSpecific instanceof UTXOSpecific) {
      throw new Error('Invalid blockchain specific');
    }
    if (keysignPayload.coin === undefined) {
      throw new Error('Invalid coin');
    }
    const utxoSpecific = keysignPayload.blockchainSpecific as unknown as {
      case: 'utxoSpecific';
      value: UTXOSpecific;
    };
    const { byteFee, sendMaxAmount } = utxoSpecific.value;
    const input = TW.Bitcoin.Proto.SigningInput.create({
      hashType: this.walletCore.BitcoinScript.hashTypeForCoin(this.coinType),
      amount: Long.fromString(keysignPayload.toAmount),
      useMaxAmount: sendMaxAmount,
      toAddress: keysignPayload.toAddress,
      changeAddress: keysignPayload.coin?.address,
      byteFee: Long.fromString(byteFee),
      coinType: this.coinType.value,
    });
    const encoder = new TextEncoder();
    const memo = keysignPayload.memo || '';
    if (memo != '') {
      input.outputOpReturn = encoder.encode(keysignPayload.memo);
    }
    for (const utxo of keysignPayload.utxoInfo) {
      const lockScript = this.walletCore.BitcoinScript.lockScriptForAddress(
        keysignPayload.coin.address,
        this.coinType
      );
      switch (this.coinType) {
        case this.walletCore.CoinType.bitcoin:
        case this.walletCore.CoinType.litecoin: {
          const segWitPubKeyHash = lockScript.matchPayToWitnessPublicKeyHash();
          const redeemScript =
            this.walletCore.BitcoinScript.buildPayToWitnessPubkeyHash(
              segWitPubKeyHash
            );
          input.scripts[
            hexEncode({
              value: segWitPubKeyHash,
              walletCore: this.walletCore,
            })
          ] = redeemScript.data();
          break;
        }
        case this.walletCore.CoinType.bitcoinCash:
        case this.walletCore.CoinType.dash:
        case this.walletCore.CoinType.dogecoin: {
          const keyHash = lockScript.matchPayToPubkeyHash();
          const redeemScriptPubKey =
            this.walletCore.BitcoinScript.buildPayToPublicKeyHash(keyHash);

          input.scripts[
            hexEncode({
              value: keyHash,
              walletCore: this.walletCore,
            })
          ] = redeemScriptPubKey.data();
          break;
        }
        default:
          throw new Error('Unsupported coin type');
      }
      const unspendTransaction = TW.Bitcoin.Proto.UnspentTransaction.create({
        amount: Long.fromString(utxo.amount.toString()),
        outPoint: TW.Bitcoin.Proto.OutPoint.create({
          hash: this.walletCore.HexCoding.decode(utxo.hash).reverse(),
          index: utxo.index,
          sequence: 0xffffffff,
        }),
        script: lockScript.data(),
      });
      input.utxo.push(unspendTransaction);
    }
    return input;
  }

  async getBitcoinTransactionPlan(
    keysignPayload: KeysignPayload
  ): Promise<TW.Bitcoin.Proto.TransactionPlan> {
    const input = await this.getPreSignedInputData(keysignPayload);
    const plan = this.walletCore.AnySigner.plan(input, this.coinType);
    return TW.Bitcoin.Proto.TransactionPlan.decode(plan);
  }
}
