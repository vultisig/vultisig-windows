import { TW } from '@trustwallet/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { utxoChainScriptType } from '../../../chain/utxo/UtxoScriptType';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { UTXOSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { match } from '../../../lib/utils/match';
import { assertField } from '../../../lib/utils/record/assertField';
import { UtxoChain } from '../../../model/chain';
import { toWalletCorePublicKey } from '../../../vault/publicKey/toWalletCorePublicKey';
import { VaultPublicKey } from '../../../vault/publicKey/VaultPublicKey';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';
import { SignedTransactionResult } from '../signed-transaction-result';

export class BlockchainServiceUtxo
  extends BlockchainService
  implements IBlockchainService
{
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const { byteFee, sendMaxAmount } = assertField(
      keysignPayload.blockchainSpecific,
      'value'
    ) as UTXOSpecific;

    const coin = shouldBePresent(keysignPayload.coin);

    const lockScript = this.walletCore.BitcoinScript.lockScriptForAddress(
      coin.address,
      this.coinType
    );

    const scriptType = utxoChainScriptType[coin.chain as UtxoChain];

    const pubKeyHash = match(scriptType, {
      wpkh: () => lockScript.matchPayToWitnessPublicKeyHash(),
      pkh: () => lockScript.matchPayToPubkeyHash(),
    });

    const scriptKey = hexEncode({
      value: pubKeyHash,
      walletCore: this.walletCore,
    });

    const script = match(scriptType, {
      wpkh: () =>
        this.walletCore.BitcoinScript.buildPayToWitnessPubkeyHash(
          pubKeyHash
        ).data(),
      pkh: () =>
        this.walletCore.BitcoinScript.buildPayToPublicKeyHash(
          pubKeyHash
        ).data(),
    });

    const input = TW.Bitcoin.Proto.SigningInput.create({
      hashType: this.walletCore.BitcoinScript.hashTypeForCoin(this.coinType),
      amount: Long.fromString(keysignPayload.toAmount),
      useMaxAmount: sendMaxAmount,
      toAddress: keysignPayload.toAddress,
      changeAddress: coin.address,
      byteFee: Long.fromString(byteFee),
      coinType: this.coinType.value,

      scripts: {
        [scriptKey]: script,
      },

      utxo: keysignPayload.utxoInfo.map(({ hash, amount, index }) =>
        TW.Bitcoin.Proto.UnspentTransaction.create({
          amount: Long.fromString(amount.toString()),
          outPoint: TW.Bitcoin.Proto.OutPoint.create({
            hash: this.walletCore.HexCoding.decode(hash).reverse(),
            index: index,
            sequence: 0xffffffff,
          }),
          script: lockScript.data(),
        })
      ),
    });

    if (keysignPayload.memo) {
      const encoder = new TextEncoder();
      input.outputOpReturn = encoder.encode(keysignPayload.memo);
    }

    const inputData = TW.Bitcoin.Proto.SigningInput.encode(input).finish();

    const plan = this.walletCore.AnySigner.plan(inputData, this.coinType);

    input.plan = TW.Bitcoin.Proto.TransactionPlan.decode(plan);

    return TW.Bitcoin.Proto.SigningInput.encode(input).finish();
  }

  public async getSignedTransaction(
    vaultPublicKey: VaultPublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const publicKey = await toWalletCorePublicKey({
      walletCore: this.walletCore,
      chain: this.chain,
      value: vaultPublicKey,
    });
    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );
    const hashes = getPreSigningHashes({
      walletCore: this.walletCore,
      txInputData,
      chain: this.chain,
    });
    hashes.forEach(hash => {
      const signature = signatureProvider.getDerSignature(hash);
      if (signature === undefined) {
        return;
      }

      assertSignature({
        publicKey,
        message: hash,
        signature,
        signatureFormat: 'der',
      });

      allSignatures.add(signature);
      publicKeys.add(publicKey.data());
    });

    const compileWithSignatures =
      this.walletCore.TransactionCompiler.compileWithSignatures(
        this.coinType,
        txInputData,
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
}
