import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { callRpc } from '../../../chain/rpc/callRpc';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { stripHexPrefix } from '../../../chain/utils/stripHexPrefix';
import { shouldBeDefined } from '../../../lib/utils/assert/shouldBeDefined';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { Endpoint } from '../../Endpoint';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';

interface RippleSubmitResponse {
  engine_result?: string;
  engine_result_message?: string;
  tx_json?: {
    hash?: string;
  };
}

export class BlockchainServiceRipple
  extends BlockchainService
  implements IBlockchainService
{
  async executeTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<string> {
    const walletCore = this.walletCore;

    const publicKeyData = publicKey.data();

    const allSignatures = walletCore.DataVector.create();
    const publicKeys = walletCore.DataVector.create();

    const [dataHash] = getPreSigningHashes({
      walletCore,
      txInputData,
      chain: this.chain,
    });

    const signatureProvider = new SignatureProvider(walletCore, signatures);
    const signature = signatureProvider.getDerSignature(dataHash);

    assertSignature({
      publicKey,
      message: dataHash,
      signature,
      signatureFormat: 'der',
    });

    allSignatures.add(signature);
    publicKeys.add(publicKeyData);

    const compileWithSignatures =
      walletCore.TransactionCompiler.compileWithSignatures(
        this.coinType,
        txInputData,
        allSignatures,
        publicKeys
      );

    const { encoded, errorMessage } = TW.Ripple.Proto.SigningOutput.decode(
      compileWithSignatures
    );

    assertErrorMessage(errorMessage);

    const rawTx = stripHexPrefix(this.walletCore.HexCoding.encode(encoded));

    const { engine_result, engine_result_message, tx_json } =
      await callRpc<RippleSubmitResponse>({
        url: Endpoint.rippleServiceRpc,
        method: 'submit',
        params: [
          {
            tx_blob: rawTx,
          },
        ],
      });

    if (engine_result && engine_result !== 'tesSUCCESS') {
      if (engine_result_message) {
        if (
          engine_result_message.toLowerCase() ===
            'this sequence number has already passed.' &&
          tx_json?.hash
        ) {
          return tx_json.hash;
        }
        return engine_result_message;
      }
    }

    return shouldBeDefined(tx_json?.hash);
  }
}
