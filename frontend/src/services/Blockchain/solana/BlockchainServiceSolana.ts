import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { RpcServiceSolana } from '../../Rpc/solana/RpcServiceSolana';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';

export class BlockchainServiceSolana
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

    const rpcService = new RpcServiceSolana();

    return rpcService.broadcastTransaction(encoded);
  }
}
