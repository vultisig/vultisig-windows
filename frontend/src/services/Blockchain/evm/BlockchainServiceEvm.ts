/* eslint-disable */
import { tss } from '../../../../wailsjs/go/models';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { IBlockchainService } from '../IBlockchainService';
import { SignedTransactionResult } from '../signed-transaction-result';
import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { BlockchainService } from '../BlockchainService';
import SignatureProvider from '../signature-provider';
import { TW } from '@trustwallet/wallet-core';
import { SpecificEvm } from '../../../model/gas-info';

export class BlockchainServiceEvm
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
    const specific_pb = new EthereumSpecific();
    const transactionInfoSpecific: SpecificEvm =
      obj.specificGasInfo as SpecificEvm;
    switch (obj.transactionType) {
      case TransactionType.SEND:
        const sendTx = obj as ISendTransaction;

        specific_pb.gasLimit = transactionInfoSpecific.gasLimit.toString();
        specific_pb.maxFeePerGasWei =
          transactionInfoSpecific.maxFeePerGasWei.toString();
        specific_pb.nonce = BigInt(transactionInfoSpecific.nonce);
        specific_pb.priorityFee =
          transactionInfoSpecific.priorityFee.toString();

        payload.blockchainSpecific = {
          case: 'ethereumSpecific',
          value: specific_pb,
        };
        break;

      // We will have to check how the swap transaction is structured for UTXO chains
      case TransactionType.SWAP:
        const swapTx = obj as ISwapTransaction;
        payload.blockchainSpecific = {
          case: 'ethereumSpecific',
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
    if (keysignPayload.blockchainSpecific instanceof EthereumSpecific) {
      throw new Error('Invalid blockchain specific');
    }

    if (keysignPayload.coin === undefined) {
      throw new Error('Invalid coin');
    }

    const evmSpecific = keysignPayload.blockchainSpecific as unknown as {
      case: 'ethereumSpecific';
      value: EthereumSpecific;
    };

    const { gasLimit, maxFeePerGasWei, nonce, priorityFee } = evmSpecific.value;

    const input = TW.Ethereum.Proto.SigningInput.create({
      toAddress: keysignPayload.toAddress,
      chainId: Buffer.from(
        this.walletCore.CoinTypeExt.chainId(this.coinType),
        'hex'
      ), // TODO: get chain id from coin
      nonce: Buffer.from(nonce.toString(), 'hex'),
      gasLimit: Buffer.from(gasLimit, 'hex'),
      maxFeePerGas: Buffer.from(maxFeePerGasWei, 'hex'),
      maxInclusionFeePerGas: Buffer.from(priorityFee, 'hex'),
      txMode: TW.Ethereum.Proto.TransactionMode.Enveloped,

      transaction: TW.Ethereum.Proto.Transaction.create({
        transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
          amount: Buffer.from(keysignPayload.toAmount, 'hex'),
          data: Buffer.from(keysignPayload.memo ?? '', 'utf8'),
        }),
      }),
    });

    const encoded = TW.Ethereum.Proto.SigningInput.encode(input).finish();
    return encoded;
  }

  public async getPreSignedImageHash(
    keysignPayload: KeysignPayload
  ): Promise<string[]> {
    const input = await this.getPreSignedInputData(keysignPayload);
    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      input
    );

    const preSignOutputs =
      TW.Ethereum.Proto.MessageSigningOutput.decode(preHashes);
    if (preSignOutputs.errorMessage !== '') {
      throw new Error(preSignOutputs.errorMessage);
    }
    const result: string[] = [];
    for (const hash of preSignOutputs.signature) {
      if (hash === undefined) {
        continue;
      }
      result.push(
        hash
        //this.walletCore.HexCoding.encode(hash.).stripHexPrefix()
      );
    }
    return result;
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
      this.walletCore.HexCoding.encode(output.encoded).stripHexPrefix(),
      output.transactionId
    );
    return result;
  }
}
