import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { broadcastUtxoTransaction } from '../../../chain/utxo/blockchair/broadcastUtxoTransaction';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { UtxoChain } from '../../../model/chain';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';

export class BlockchainServiceUtxo
  extends BlockchainService
  implements IBlockchainService
{
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
