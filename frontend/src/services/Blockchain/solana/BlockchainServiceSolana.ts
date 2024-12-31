import { TW } from '@trustwallet/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { SolanaSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { toWalletCorePublicKey } from '../../../vault/publicKey/toWalletCorePublicKey';
import { VaultPublicKey } from '../../../vault/publicKey/VaultPublicKey';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';
import { SignedTransactionResult } from '../signed-transaction-result';

export class BlockchainServiceSolana
  extends BlockchainService
  implements IBlockchainService
{
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
      recentBlockHash,
      fromTokenAssociatedAddress,
      toTokenAssociatedAddress,
    } = specific;

    const priorityFeePrice = 1_000_000; // Turbo fee in lamports, around 5 cents
    const priorityFeeLimit = Number(100_000); // Turbo fee in lamports, around 5 cents
    const newRecentBlockHash = recentBlockHash; // DKLS should fix it. Using the same, since fetching the latest block hash won't match with IOS and Android

    if (keysignPayload.coin.isNativeToken) {
      // Native token transfer
      const input = TW.Solana.Proto.SigningInput.create({
        transferTransaction: TW.Solana.Proto.Transfer.create({
          recipient: keysignPayload.toAddress,
          value: Long.fromString(keysignPayload.toAmount),
          memo: keysignPayload?.memo,
        }),
        recentBlockhash: newRecentBlockHash,
        sender: keysignPayload.coin.address,
        priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
          price: Long.fromString(priorityFeePrice.toString()),
        }),
        priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
          limit: priorityFeeLimit,
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
          recentBlockhash: newRecentBlockHash,
          sender: keysignPayload.coin.address,
          priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
            price: Long.fromString(priorityFeePrice.toString()),
          }),
          priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
            limit: priorityFeeLimit,
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
          recentBlockhash: newRecentBlockHash,
          sender: keysignPayload.coin.address,
          priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
            price: Long.fromString(priorityFeePrice.toString()),
          }),
          priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
            limit: priorityFeeLimit,
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

  public async getSignedTransaction(
    vaultPublicKey: VaultPublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const publicKey = await toWalletCorePublicKey({
      walletCore: this.walletCore,
      value: vaultPublicKey,
      chain: this.chain,
    });
    const publicKeyData = publicKey.data();

    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      txInputData
    );

    const { errorMessage, data } =
      TW.Solana.Proto.PreSigningOutput.decode(preHashes);

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

    const { encoded, errorMessage: solanaErrorMessage } =
      TW.Solana.Proto.SigningOutput.decode(compiled);

    assertErrorMessage(solanaErrorMessage);

    const result = new SignedTransactionResult(
      encoded,
      encoded // TODO: Change this to the actual transaction hash
    );

    return result;
  }
}
