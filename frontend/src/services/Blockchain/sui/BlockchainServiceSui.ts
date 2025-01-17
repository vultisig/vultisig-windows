import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { getBlockchainSpecificValue } from '../../../chain/keysign/KeysignChainSpecific';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { SuiCoin } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { Chain } from '../../../model/chain';
import { BlockchainService } from '../BlockchainService';
import {
  IBlockchainService,
  SignedTransactionResult,
} from '../IBlockchainService';
import SignatureProvider from '../signature-provider';

export class BlockchainServiceSui
  extends BlockchainService
  implements IBlockchainService
{
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    if (keysignPayload.coin?.chain !== Chain.Sui) {
      console.error('Coin is not Sui');
      console.error('keysignPayload.coin?.chain:', keysignPayload.coin?.chain);
    }

    const { coins, referenceGasPrice } = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'suicheSpecific'
    );

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
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
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

    assertSignature({
      publicKey,
      signature,
      message: dataHash,
    });

    allSignatures.add(signature);
    publicKeys.add(publicKeyData);

    const compiled = this.walletCore.TransactionCompiler.compileWithSignatures(
      this.coinType,
      txInputData,
      allSignatures,
      publicKeys
    );

    const {
      unsignedTx,
      errorMessage: suiErrorMessage,
      signature: compiledSignature,
    } = TW.Sui.Proto.SigningOutput.decode(compiled);

    assertErrorMessage(suiErrorMessage);

    const txBytes = Buffer.from(unsignedTx, 'base64');
    const txHash = Buffer.from(this.walletCore.Hash.sha3_256(txBytes)).toString(
      'base64'
    );

    return {
      rawTx: unsignedTx,
      txHash,
      signature: compiledSignature,
    };
  }
}
