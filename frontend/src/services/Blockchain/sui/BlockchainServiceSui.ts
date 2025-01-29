import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { callRpc } from '../../../chain/rpc/callRpc';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { Endpoint } from '../../Endpoint';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';

export class BlockchainServiceSui
  extends BlockchainService
  implements IBlockchainService
{
  public async executeTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<string> {
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

    const { digest } = await callRpc<SuiExecuteTransactionBlockResult>({
      url: Endpoint.suiServiceRpc,
      method: 'sui_executeTransactionBlock',
      params: [unsignedTx, [compiledSignature]],
    });

    return digest;
  }
}

type SuiExecuteTransactionBlockResult = {
  digest: string;
};
