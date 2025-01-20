import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { getBlockchainSpecificValue } from '../../../chain/keysign/KeysignChainSpecific';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { broadcastUtxoTransaction } from '../../../chain/utxo/blockchair/broadcastUtxoTransaction';
import { utxoChainScriptType } from '../../../chain/utxo/UtxoScriptType';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { match } from '../../../lib/utils/match';
import { UtxoChain } from '../../../model/chain';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';

export class BlockchainServiceUtxo
  extends BlockchainService
  implements IBlockchainService
{
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const { byteFee, sendMaxAmount } = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'utxoSpecific'
    );

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

  public async executeTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<string> {
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

    await broadcastUtxoTransaction({
      chain: this.chain as UtxoChain,
      tx: hexEncode({
        value: output.encoded,
        walletCore: this.walletCore,
      }),
    });

    return output.transactionId;
  }
}
