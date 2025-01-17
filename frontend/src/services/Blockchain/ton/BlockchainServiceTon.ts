import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { getBlockchainSpecificValue } from '../../../chain/keysign/KeysignChainSpecific';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { assertField } from '../../../lib/utils/record/assertField';
import { BlockchainService } from '../BlockchainService';
import {
  IBlockchainService,
  SignedTransactionResult,
} from '../IBlockchainService';
import SignatureProvider from '../signature-provider';

export class BlockchainServiceTon
  extends BlockchainService
  implements IBlockchainService
{
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const specific = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'tonSpecific'
    );

    const coin = assertField(keysignPayload, 'coin');

    const { expireAt, sequenceNumber } = specific;

    const pubKeyData = Buffer.from(coin.hexPublicKey, 'hex');

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
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
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

    return {
      rawTx: output.encoded,
      txHash: Buffer.from(output.hash).toString('base64'),
    };
  }
}
