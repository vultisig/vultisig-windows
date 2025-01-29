import { TW } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { keccak256 } from 'js-sha3';

import { tss } from '../../../../wailsjs/go/models';
import { getEvmPublicClient } from '../../../chain/evm/chainInfo';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { generateSignatureWithRecoveryId } from '../../../chain/utils/generateSignatureWithRecoveryId';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { isInError } from '../../../lib/utils/error/isInError';
import { EvmChain } from '../../../model/chain';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';

export class BlockchainServiceEvm
  extends BlockchainService
  implements IBlockchainService
{
  public async executeTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<string> {
    const [dataHash] = getPreSigningHashes({
      walletCore: this.walletCore,
      chain: this.chain,
      txInputData,
    });

    const signature = generateSignatureWithRecoveryId({
      walletCore: this.walletCore,
      signature:
        signatures[hexEncode({ value: dataHash, walletCore: this.walletCore })],
    });

    assertSignature({
      publicKey,
      signature,
      message: dataHash,
    });

    const allSignatures = this.walletCore.DataVector.createWithData(signature);

    const compiled = this.walletCore.TransactionCompiler.compileWithSignatures(
      this.coinType,
      txInputData,
      allSignatures,
      this.walletCore.DataVector.create()
    );

    const { errorMessage, encoded } =
      TW.Ethereum.Proto.SigningOutput.decode(compiled);

    assertErrorMessage(errorMessage);

    const rawTx = this.walletCore.HexCoding.encode(encoded);
    const txHash = '0x' + keccak256(encoded);

    const publicClient = getEvmPublicClient(this.chain as EvmChain);

    try {
      const hash = await publicClient.sendRawTransaction({
        serializedTransaction: rawTx as `0x${string}`,
      });
      return hash;
    } catch (error) {
      const isAlreadyBroadcast = isInError(
        error,
        'already known',
        'transaction is temporarily banned',
        'nonce too low',
        'transaction already exists'
      );

      if (isAlreadyBroadcast) {
        return txHash;
      }

      throw error;
    }
  }
}
