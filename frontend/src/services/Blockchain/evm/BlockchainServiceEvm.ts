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
import {
  CoinType,
  HexCoding,
} from '@trustwallet/wallet-core/dist/src/wallet-core';
import { Chain } from '../../../model/chain';
import { AddressServiceFactory } from '../../Address/AddressServiceFactory';

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

    console.log('payload:', payload);

    return payload;
  }

  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const blockchainSpecific = keysignPayload.blockchainSpecific as
      | { case: 'ethereumSpecific'; value: EthereumSpecific }
      | undefined;

    if (!blockchainSpecific || blockchainSpecific.case !== 'ethereumSpecific') {
      throw new Error('Invalid blockchain specific');
    }

    const evmSpecific = blockchainSpecific.value;

    if (!keysignPayload.coin) {
      throw new Error('Invalid coin');
    }

    const { gasLimit, maxFeePerGasWei, nonce, priorityFee } = evmSpecific;

    // Helper function to convert string representation of bigint to hex and strip the '0x' prefix
    const stringToHex = (value: string): string => {
      const bigintValue = BigInt(value);
      let hexString = bigintValue.toString(16);
      if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString;
      }
      return hexString;
    };

    const stripHexPrefix = (hex: string): string => {
      return hex.startsWith('0x') ? hex.slice(2) : hex;
    };

    const chainId: bigint = BigInt(1);

    // Chain ID: converted to hexadecimal, stripped of '0x', and padded
    const chainIdHex = Buffer.from(
      stripHexPrefix(chainId.toString(16).padStart(2, '0')),
      'hex'
    );
    console.log('Chain ID (Hex):', chainIdHex.toString('hex'));

    // Nonce: converted to hexadecimal, stripped of '0x', and padded
    const nonceHex = Buffer.from(
      stripHexPrefix(stringToHex(nonce.toString()).padStart(2, '0')),
      'hex'
    );
    console.log('Nonce (Hex):', nonceHex.toString('hex'));

    // Gas limit: converted to hexadecimal, stripped of '0x'
    const gasLimitHex = Buffer.from(
      stripHexPrefix(stringToHex(gasLimit)),
      'hex'
    );
    console.log('Gas Limit (Hex):', gasLimitHex.toString('hex'));

    // Max fee per gas: converted to hexadecimal, stripped of '0x'
    const maxFeePerGasHex = Buffer.from(
      stripHexPrefix(stringToHex(maxFeePerGasWei)),
      'hex'
    );
    console.log('Max Fee Per Gas (Hex):', maxFeePerGasHex.toString('hex'));

    // Max inclusion fee per gas (priority fee): converted to hexadecimal, stripped of '0x'
    const maxInclusionFeePerGasHex = Buffer.from(
      stripHexPrefix(stringToHex(priorityFee)),
      'hex'
    );
    console.log(
      'Max Inclusion Fee Per Gas (Hex):',
      maxInclusionFeePerGasHex.toString('hex')
    );

    // Amount: converted to hexadecimal, stripped of '0x'
    const amountHex = Buffer.from(
      stripHexPrefix(stringToHex(keysignPayload.toAmount)),
      'hex'
    );
    console.log('Amount (Hex):', amountHex.toString('hex'));

    // Create the signing input with the constants
    const input = TW.Ethereum.Proto.SigningInput.create({
      toAddress: keysignPayload.toAddress,
      chainId: chainIdHex,
      nonce: nonceHex,
      gasLimit: gasLimitHex,
      maxFeePerGas: maxFeePerGasHex,
      maxInclusionFeePerGas: maxInclusionFeePerGasHex,
      txMode: TW.Ethereum.Proto.TransactionMode.Enveloped,
      transaction: TW.Ethereum.Proto.Transaction.create({
        transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
          amount: amountHex,
          data: Buffer.from(keysignPayload.memo ?? '', 'utf8'),
        }),
      }),
    });

    // const input = TW.Ethereum.Proto.SigningInput.create({
    //   toAddress: "0x4Bf231Bf4Cb92e8d249a3D8db813F075Ba1c5Dfe",
    //   chainId: Buffer.from("01", "hex"),
    //   nonce: Buffer.from("09", "hex"),
    //   gasPrice: Buffer.from("04a817c800", "hex"),
    //   gasLimit: Buffer.from("5208", "hex"),
    //   transaction: TW.Ethereum.Proto.Transaction.create({
    //     transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
    //       amount: Buffer.from("0de0b6b3a7640000", "hex"),
    //     }),
    //   }),
    // });

    console.log('input VALID:', TW.Ethereum.Proto.SigningInput.verify(input));
    console.log('input JSON:', input.toJSON());

    return TW.Ethereum.Proto.SigningInput.encode(input).finish();
  }

  public async getPreSignedImageHash(
    keysignPayload: KeysignPayload
  ): Promise<string[]> {
    const input = await this.getPreSignedInputData(keysignPayload);
    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType as CoinType,
      input
    );

    const preSigningOutput =
      TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);
    if (preSigningOutput.errorMessage !== '') {
      console.log('preSigningOutput error:', preSigningOutput.errorMessage);
      throw new Error(preSigningOutput.errorMessage);
    }

    console.log('preSigningOutput:', preSigningOutput);
    console.log('preSigningOutput.dataHash:', preSigningOutput.dataHash);

    const imageHashes = [
      this.walletCore.HexCoding.encode(
        preSigningOutput.dataHash
      ).stripHexPrefix(),
    ];
    console.log('imageHashes:', imageHashes);
    return imageHashes;
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

    const addressService = AddressServiceFactory.createAddressService(
      this.chain,
      this.walletCore
    );
    const evmPublicKey = await addressService.getDerivedPubKey(
      vaultHexPublicKey,
      vaultHexChainCode,
      this.walletCore.CoinTypeExt.derivationPath(this.coinType)
    );
    const publicKeyData = Buffer.from(evmPublicKey, 'hex');
    const publicKey = this.walletCore.PublicKey.createWithData(
      publicKeyData,
      this.walletCore.PublicKeyType.secp256k1
    );

    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      inputData
    );

    const publicKeys = this.walletCore.DataVector.create();
    const preSigningOutput: TW.TxCompiler.Proto.PreSigningOutput =
      TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

    if (preSigningOutput.errorMessage !== '') {
      throw new Error(preSigningOutput.errorMessage);
    }

    const allSignatures = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );
    const signature = signatureProvider.getSignatureWithRecoveryId(
      preSigningOutput.dataHash
    );

    if (!publicKey.verify(signature, preSigningOutput.dataHash)) {
      throw new Error('Failed to verify signature');
    }

    allSignatures.add(signature);
    publicKeys.add(publicKeyData);

    const compiled = this.walletCore.TransactionCompiler.compileWithSignatures(
      this.coinType,
      inputData,
      allSignatures,
      publicKeys
    );

    const output = TW.Ethereum.Proto.SigningOutput.decode(compiled);

    if (output.errorMessage !== '') {
      throw new Error(output.errorMessage);
    }

    const result = new SignedTransactionResult(
      this.walletCore.HexCoding.encode(output.encoded).stripHexPrefix(),
      this.walletCore.HexCoding.encode(output.encoded)
    );
    return result;
  }
}
