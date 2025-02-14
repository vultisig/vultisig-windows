import { KeysignPayload } from "@core/communication/vultisig/keysign/v1/keysign_message_pb";
import {
  ChainsBySpecific,
  KeysignChainSpecificKey,
  KeysignChainSpecificValueByKey,
} from "@core/keysign/chainSpecific/KeysignChainSpecific";
import { WalletCore } from "@trustwallet/wallet-core";

export type GetPreSignedInputDataInput<T extends KeysignChainSpecificKey> = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
  chain: ChainsBySpecific<T>;
  chainSpecific: KeysignChainSpecificValueByKey<T>;
};

export type PreSignedInputDataResolver<T extends KeysignChainSpecificKey> = (
  input: GetPreSignedInputDataInput<T>,
) => Uint8Array<ArrayBufferLike>;
