import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { SignedTransactionResult } from './signed-transaction-result';
import { tss } from '../../../wailsjs/go/models';
import {
  ITransaction,
  ISendTransaction,
  ISwapTransaction,
} from '../../model/transaction';

export interface IBlockchainService {
  getPreSignedInputData(keysignPayload: KeysignPayload): Promise<Uint8Array>;

  getPreSignedImageHash(keysignPayload: KeysignPayload): Promise<string[]>;

  getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    data: KeysignPayload | Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult>;

  createKeysignPayload(
    obj: ITransaction | ISendTransaction | ISwapTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload;
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
