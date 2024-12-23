import { storage, tss } from '../../../wailsjs/go/models';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import {
  IDepositTransactionVariant,
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
} from '../../model/transaction';
import { SignedTransactionResult } from './signed-transaction-result';

export interface IBlockchainService {
  getPreSignedInputData(keysignPayload: KeysignPayload): Promise<Uint8Array>;

  getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    data: KeysignPayload | Uint8Array,
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

  signAndBroadcastTransaction(
    vault: storage.Vault,
    messages: string[],
    sessionID: string,
    hexEncryptionKey: string,
    serverURL: string,
    keysignPayload: KeysignPayload
  ): Promise<string>;
}

export interface IBlockchainServiceThorchain {
  isTHORChainSpecific(obj: any): boolean;
}

export interface ISwapBlockchainService {
  getSwapPreSignedInputData(
    keysignPayload: KeysignPayload,
    signingInput: any
  ): Uint8Array;
}
