import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { TonSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { toWalletCorePublicKey } from '../../../vault/publicKey/toWalletCorePublicKey';
import { VaultPublicKey } from '../../../vault/publicKey/VaultPublicKey';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';
import { SignedTransactionResult } from '../signed-transaction-result';

export class BlockchainServiceTon
  extends BlockchainService
  implements IBlockchainService
{
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const blockchainSpecific = keysignPayload.blockchainSpecific as
      | { case: 'tonSpecific'; value: TonSpecific }
      | undefined;

    if (!blockchainSpecific || blockchainSpecific.case !== 'tonSpecific') {
      throw new Error('Invalid blockchain specific');
    }

    const specific = blockchainSpecific.value;

    if (!keysignPayload.coin) {
      throw new Error('Invalid coin');
    }

    const { expireAt, sequenceNumber } = specific;

    const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }

    const tokenTransferMessage = TW.TheOpenNetwork.Proto.Transfer.create({
      dest: keysignPayload.toAddress,
      amount: new Long(Number(keysignPayload.toAmount)),
      bounceable:
        (keysignPayload.memo &&
          ['d', 'w'].includes(keysignPayload.memo.trim())) ||
        false,
      comment: keysignPayload.memo,
      mode:
        TW.TheOpenNetwork.Proto.SendMode.PAY_FEES_SEPARATELY |
        TW.TheOpenNetwork.Proto.SendMode.IGNORE_ACTION_PHASE_ERRORS,
    });

    const inputObject = {
      walletVersion: TW.TheOpenNetwork.Proto.WalletVersion.WALLET_V4_R2,
      expireAt: Number(expireAt.toString()),
      sequenceNumber: Number(sequenceNumber.toString()),
      messages: [tokenTransferMessage],
      publicKey: new Uint8Array(pubKeyData),
    };

    // Native token transfer
    const input = TW.TheOpenNetwork.Proto.SigningInput.create(inputObject);

    // Encode the input
    const encodedInput =
      TW.TheOpenNetwork.Proto.SigningInput.encode(input).finish();

    return encodedInput;
  }

  public async getSignedTransaction(
    vaultPublicKey: VaultPublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const publicKey: PublicKey = await toWalletCorePublicKey({
      walletCore: this.walletCore,
      value: vaultPublicKey,
      chain: this.chain,
    });
    const publicKeyData = publicKey.data();

    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      txInputData
    );

    const { data, errorMessage } =
      TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

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

    const output = TW.TheOpenNetwork.Proto.SigningOutput.decode(compiled);

    assertErrorMessage(output.errorMessage);

    const result = new SignedTransactionResult(
      output.encoded,
      Buffer.from(output.hash).toString('base64')
    );

    return result;
  }
}
