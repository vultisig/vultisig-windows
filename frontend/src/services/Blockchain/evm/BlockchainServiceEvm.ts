import { TW } from '@trustwallet/wallet-core';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { keccak256 } from 'js-sha3';

import { tss } from '../../../../wailsjs/go/models';
import { bigIntToHex } from '../../../chain/utils/bigIntToHex';
import { stripHexPrefix } from '../../../chain/utils/stripHexPrefix';
import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../../model/chain';
import { SpecificEvm } from '../../../model/specific-transaction-info';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { AddressServiceFactory } from '../../Address/AddressServiceFactory';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';
import { SignedTransactionResult } from '../signed-transaction-result';

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
      obj.specificTransactionInfo as SpecificEvm;
    switch (obj.transactionType) {
      case TransactionType.SEND:
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

    const chain: bigint = BigInt(
      this.walletCore.CoinTypeExt.chainId(this.coinType)
    );

    // Chain ID: converted to hexadecimal, stripped of '0x', and padded
    let chainHex = Buffer.from(
      stripHexPrefix(chain.toString(16).padStart(2, '0')),
      'hex'
    );
    if (this.chain === Chain.Zksync) {
      chainHex = Buffer.from(
        stripHexPrefix(chain.toString(16).padStart(4, '0')), // Ensure proper padding
        'hex'
      );
    }

    // Nonce: converted to hexadecimal, stripped of '0x', and padded
    const nonceHex = Buffer.from(
      stripHexPrefix(bigIntToHex(nonce).padStart(2, '0')),
      'hex'
    );

    // Gas limit: converted to hexadecimal, stripped of '0x'
    const gasLimitHex = Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(gasLimit))),
      'hex'
    );

    // Max fee per gas: converted to hexadecimal, stripped of '0x'
    const maxFeePerGasHex = Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(maxFeePerGasWei))),
      'hex'
    );

    // Max inclusion fee per gas (priority fee): converted to hexadecimal, stripped of '0x'
    const maxInclusionFeePerGasHex = Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(priorityFee))),
      'hex'
    );

    // Amount: converted to hexadecimal, stripped of '0x'
    const amountHex = Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
      'hex'
    );

    // Send native tokens
    let toAddress = keysignPayload.toAddress;
    let evmTransaction = TW.Ethereum.Proto.Transaction.create({
      transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
        amount: amountHex,
        data: Buffer.from(keysignPayload.memo ?? '', 'utf8'),
      }),
    });

    // Send ERC20 tokens, it will replace the transaction object
    if (!keysignPayload.coin.isNativeToken) {
      toAddress = keysignPayload.coin.contractAddress;
      evmTransaction = TW.Ethereum.Proto.Transaction.create({
        erc20Transfer: TW.Ethereum.Proto.Transaction.ERC20Transfer.create({
          amount: amountHex,
          to: keysignPayload.toAddress,
        }),
      });
    }

    // Create the signing input with the constants
    const input = TW.Ethereum.Proto.SigningInput.create({
      toAddress: toAddress,
      chainId: chainHex,
      nonce: nonceHex,
      gasLimit: gasLimitHex,
      maxFeePerGas: maxFeePerGasHex,
      maxInclusionFeePerGas: maxInclusionFeePerGasHex,
      txMode: TW.Ethereum.Proto.TransactionMode.Enveloped,
      transaction: evmTransaction,
    });

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
      console.error('preSigningOutput error:', preSigningOutput.errorMessage);
      throw new Error(preSigningOutput.errorMessage);
    }

    const imageHashes = [
      stripHexPrefix(
        this.walletCore.HexCoding.encode(preSigningOutput.dataHash)
      ),
    ];

    return imageHashes;
  }

  public async getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    data: KeysignPayload | Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    try {
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
        console.error('Failed to verify signature');
        throw new Error('Failed to verify signature');
      }

      allSignatures.add(signature);
      const compiled =
        this.walletCore.TransactionCompiler.compileWithSignatures(
          this.coinType,
          inputData,
          allSignatures,
          publicKeys
        );

      const output = TW.Ethereum.Proto.SigningOutput.decode(compiled);
      if (output.errorMessage !== '') {
        console.error('output error:', output.errorMessage);
        throw new Error(output.errorMessage);
      }

      const result = new SignedTransactionResult(
        this.walletCore.HexCoding.encode(output.encoded),
        '0x' + keccak256(output.encoded)
      );
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
