import { tss } from '../../../wailsjs/go/models';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import {
  IDepositTransactionVariant,
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
} from '../../model/transaction';
import { VaultPublicKey } from '../../vault/publicKey/VaultPublicKey';
import { SignedTransactionResult } from './signed-transaction-result';

export interface IBlockchainService {
  getPreSignedInputData(keysignPayload: KeysignPayload): Promise<Uint8Array>;

  getSignedTransaction(
    vaultPublicKey: VaultPublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult>;

  createKeysignPayload(
    obj:
      | ITransaction
      | ISendTransaction
      | ISwapTransaction
      | IDepositTransactionVariant,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload;
}

export interface ISwapBlockchainService {
  getSwapPreSignedInputData(
    keysignPayload: KeysignPayload,
    signingInput: any
  ): Uint8Array;
}
