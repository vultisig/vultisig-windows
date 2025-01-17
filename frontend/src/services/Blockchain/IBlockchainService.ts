import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../wailsjs/go/models';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';

export type SignedTransactionResult = {
  rawTx: string;
  txHash: string;
  signature?: string;
};

export interface IBlockchainService {
  getPreSignedInputData(keysignPayload: KeysignPayload): Promise<Uint8Array>;

  getSignedTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult>;
}
