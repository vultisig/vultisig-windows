import { TW } from '@trustwallet/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { IBlockchainService } from '../IBlockchainService';
import TxCompiler = TW.TxCompiler;
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { callRpc } from '../../../chain/rpc/callRpc';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { Endpoint } from '../../Endpoint';
import { BlockchainService } from '../BlockchainService';
import SignatureProvider from '../signature-provider';

export class BlockchainServicePolkadot
  extends BlockchainService
  implements IBlockchainService
{
  public async executeTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<string> {
    const publicKeyData = publicKey.data();

    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      txInputData
    );

    const { data, errorMessage } =
      TxCompiler.Proto.PreSigningOutput.decode(preHashes);

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

    const { errorMessage: polkadotErrorMessage, encoded } =
      TW.Polkadot.Proto.SigningOutput.decode(compiled);

    assertErrorMessage(polkadotErrorMessage);

    const rawTx = this.walletCore.HexCoding.encode(encoded);

    return callRpc({
      url: Endpoint.polkadotServiceRpc,
      method: 'author_submitExtrinsic',
      params: [rawTx],
    });
  }
}
