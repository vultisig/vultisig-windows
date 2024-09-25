/* eslint-disable */
import { TW } from '@trustwallet/wallet-core';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { IBlockchainService } from '../IBlockchainService';
import { SolanaSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { BlockchainService } from '../BlockchainService';
import { SpecificSolana } from '../../../model/specific-transaction-info';
import { SignedTransactionResult } from '../signed-transaction-result';
import { storage, tss } from '../../../../wailsjs/go/models';
import { AddressServiceFactory } from '../../Address/AddressServiceFactory';
import SignatureProvider from '../signature-provider';
import {
  CoinType,
  PublicKey,
} from '@trustwallet/wallet-core/dist/src/wallet-core';
import Long from 'long';
import { Keysign } from '../../../../wailsjs/go/tss/TssService';
import { ChainUtils } from '../../../model/chain';
import { CoinServiceFactory } from '../../Coin/CoinServiceFactory';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';

export class BlockchainServiceSolana
  extends BlockchainService
  implements IBlockchainService
{
  async signAndBroadcastTransaction(
    vault: storage.Vault,
    messages: string[],
    sessionID: string,
    hexEncryptionKey: string,
    serverURL: string,
    keysignPayload: KeysignPayload
  ): Promise<string> {
    try {
      const coinService = CoinServiceFactory.createCoinService(
        this.chain,
        this.walletCore
      );

      const rpcService = RpcServiceFactory.createRpcService(this.chain);

      const tssType = ChainUtils.getTssKeysignType(this.chain);

      const keysignGoLang = await Keysign(
        vault,
        messages,
        vault.local_party_id,
        this.walletCore.CoinTypeExt.derivationPath(coinService.getCoinType()),
        sessionID,
        hexEncryptionKey,
        serverURL,
        tssType.toString().toLowerCase()
      );

      const signatures: { [key: string]: tss.KeysignResponse } = {};
      messages.forEach((msg, idx) => {
        signatures[msg] = keysignGoLang[idx];
      });

      const signedTx = await this.getSignedTransaction(
        vault.public_key_eddsa,
        vault.hex_chain_code,
        keysignPayload,
        signatures
      );

      if (!signedTx) {
        console.error("Couldn't sign transaction");
        return "Couldn't sign transaction";
      }

      let txBroadcastedHash = await rpcService.broadcastTransaction(
        signedTx.rawTransaction
      );

      console.log('txBroadcastedHash:', txBroadcastedHash);
      console.log('txHash:', signedTx.transactionHash);

      if (txBroadcastedHash !== signedTx.transactionHash) {
        if (txBroadcastedHash === 'Transaction already broadcasted.') {
          txBroadcastedHash = signedTx.transactionHash;
        } else {
          return 'Transaction hash mismatch';
        }
      }
      return txBroadcastedHash;
    } catch (e: any) {
      console.error(e);
      return e.message;
    }
  }

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
    const specific_pb = new SolanaSpecific();
    const transactionInfoSpecific: SpecificSolana =
      obj.specificTransactionInfo as SpecificSolana;

    switch (obj.transactionType) {
      case TransactionType.SEND:
        specific_pb.fromTokenAssociatedAddress =
          transactionInfoSpecific.fromAddressPubKey;
        specific_pb.toTokenAssociatedAddress =
          transactionInfoSpecific.toAddressPubKey;
        specific_pb.priorityFee =
          transactionInfoSpecific.priorityFee.toString();
        specific_pb.recentBlockHash = transactionInfoSpecific.recentBlockHash;

        payload.blockchainSpecific = {
          case: 'solanaSpecific',
          value: specific_pb,
        };
        break;

      case TransactionType.SWAP:
        payload.blockchainSpecific = {
          case: 'solanaSpecific',
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
      | { case: 'solanaSpecific'; value: SolanaSpecific }
      | undefined;

    if (!blockchainSpecific || blockchainSpecific.case !== 'solanaSpecific') {
      throw new Error('Invalid blockchain specific');
    }

    const specific = blockchainSpecific.value;

    if (!keysignPayload.coin) {
      throw new Error('Invalid coin');
    }

    const {
      priorityFee,
      recentBlockHash,
      fromTokenAssociatedAddress,
      toTokenAssociatedAddress,
    } = specific;

    if (keysignPayload.coin.isNativeToken) {
      // Native token transfer
      const input = TW.Solana.Proto.SigningInput.create({
        transferTransaction: TW.Solana.Proto.Transfer.create({
          recipient: keysignPayload.toAddress,
          value: Long.fromString(keysignPayload.toAmount),
          memo: keysignPayload?.memo,
        }),
        recentBlockhash: recentBlockHash,
        sender: keysignPayload.coin.address,
        priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
          price: Long.fromString(priorityFee),
        }),
      });

      // Encode the input
      const encodedInput = TW.Solana.Proto.SigningInput.encode(input).finish();

      return encodedInput;
    } else {
      // Token transfer
      if (fromTokenAssociatedAddress && toTokenAssociatedAddress) {
        // Both addresses are available for token transfer
        const tokenTransferMessage = TW.Solana.Proto.TokenTransfer.create({
          tokenMintAddress: keysignPayload.coin.contractAddress,
          senderTokenAddress: fromTokenAssociatedAddress,
          recipientTokenAddress: toTokenAssociatedAddress,
          amount: Long.fromString(keysignPayload.toAmount),
          decimals: keysignPayload.coin.decimals,
        });

        const input = TW.Solana.Proto.SigningInput.create({
          tokenTransferTransaction: tokenTransferMessage,
          recentBlockhash: recentBlockHash,
          sender: keysignPayload.coin.address,
          priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
            price: Long.fromString(priorityFee),
          }),
        });

        return TW.Solana.Proto.SigningInput.encode(input).finish();
      } else if (fromTokenAssociatedAddress && !toTokenAssociatedAddress) {
        // Generate the associated address if `toTokenAssociatedAddress` is missing
        const receiverAddress = this.walletCore.SolanaAddress.createWithString(
          keysignPayload.toAddress
        );
        const generatedAssociatedAddress = receiverAddress.defaultTokenAddress(
          keysignPayload.coin.contractAddress
        );

        if (!generatedAssociatedAddress) {
          throw new Error(
            'We must have the association between the minted token and the TO address'
          );
        }

        const createAndTransferTokenMessage =
          TW.Solana.Proto.CreateAndTransferToken.create({
            recipientMainAddress: keysignPayload.toAddress,
            tokenMintAddress: keysignPayload.coin.contractAddress,
            recipientTokenAddress: generatedAssociatedAddress,
            senderTokenAddress: fromTokenAssociatedAddress,
            amount: Long.fromString(keysignPayload.toAmount),
            decimals: keysignPayload.coin.decimals,
          });

        const input = TW.Solana.Proto.SigningInput.create({
          createAndTransferTokenTransaction: createAndTransferTokenMessage,
          recentBlockhash: recentBlockHash,
          sender: keysignPayload.coin.address,
          priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
            price: Long.fromString(priorityFee),
          }),
        });

        return TW.Solana.Proto.SigningInput.encode(input).finish();
      } else {
        throw new Error(
          'To send tokens we must have the association between the minted token and the TO address'
        );
      }
    }
  }

  public async getPreSignedImageHash(
    keysignPayload: KeysignPayload
  ): Promise<string[]> {
    // Get the pre-signed input data
    const input = await this.getPreSignedInputData(keysignPayload);

    // Compile pre-image hashes using TransactionCompiler
    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType as CoinType,
      input
    );

    // Decode the result into a Solana-specific PreSigningOutput
    const preSigningOutput = TW.Solana.Proto.PreSigningOutput.decode(preHashes);

    // Check for any error messages
    if (preSigningOutput.errorMessage !== '') {
      console.error('preSigningOutput error:', preSigningOutput.errorMessage);
      throw new Error(preSigningOutput.errorMessage);
    }

    // Convert the result data to hex, and ensure consistency with Swift output
    const imageHashes = [
      this.walletCore.HexCoding.encode(preSigningOutput.data).stripHexPrefix(),
    ];

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

    const publicKey: PublicKey = await addressService.getPublicKey(
      '',
      vaultHexPublicKey,
      vaultHexChainCode
    );
    const publicKeyData = publicKey.data();

    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      inputData
    );

    const preSigningOutput = TW.Solana.Proto.PreSigningOutput.decode(preHashes);
    if (preSigningOutput.errorMessage !== '') {
      throw new Error(preSigningOutput.errorMessage);
    }

    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );
    const signature = signatureProvider.getSignature(preSigningOutput.data);

    if (!publicKey.verify(signature, preSigningOutput.data)) {
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

    const output = TW.Solana.Proto.SigningOutput.decode(compiled);
    if (output.errorMessage !== '') {
      throw new Error(output.errorMessage);
    }

    const result = new SignedTransactionResult(
      output.encoded,
      output.encoded // TODO: Change this to the actual transaction hash
    );

    console.log('Signed transaction:', result);

    return result;
  }
}
