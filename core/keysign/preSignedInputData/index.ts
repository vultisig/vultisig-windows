import { Chain } from "@core/chain/Chain";
import { KeysignPayload } from "@core/communication/vultisig/keysign/v1/keysign_message_pb";
import {
  getBlockchainSpecificValue,
  KeysignChainSpecificKey,
} from "@core/keysign/chainSpecific/KeysignChainSpecific";
import { WalletCore } from "@trustwallet/wallet-core";

import { getCosmosPreSignedInputData } from "./cosmos";
import { getEvmPreSignedInputData } from "./evm";
import { getMayaPreSignedInputData } from "./maya";
import { getPolkadotPreSignedInputData } from "./polkadot";
import { GetPreSignedInputDataInput } from "./PreSignedInputDataResolver";
import { getRipplePreSignedInputData } from "./ripple";
import { getSolanaPreSignedInputData } from "./solana";
import { getSuiPreSignedInputData } from "./sui";
import { getThorPreSignedInputData } from "./thor";
import { getTonPreSignedInputData } from "./ton";
import { getUtxoPreSignedInputData } from "./utxo";

type Input = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
  chain: Chain;
};

const handlers: Record<
  KeysignChainSpecificKey,
  (input: GetPreSignedInputDataInput<any>) => Uint8Array
> = {
  cosmosSpecific: getCosmosPreSignedInputData,
  ethereumSpecific: getEvmPreSignedInputData,
  mayaSpecific: getMayaPreSignedInputData,
  polkadotSpecific: getPolkadotPreSignedInputData,
  rippleSpecific: getRipplePreSignedInputData,
  solanaSpecific: getSolanaPreSignedInputData,
  suicheSpecific: getSuiPreSignedInputData,
  thorchainSpecific: getThorPreSignedInputData,
  tonSpecific: getTonPreSignedInputData,
  utxoSpecific: getUtxoPreSignedInputData,
  tronSpecific: () => {
    throw new Error("Tron is not supported");
  },
};

export const getPreSignedInputData = (input: Input) => {
  const { blockchainSpecific } = input.keysignPayload;
  if (!blockchainSpecific.case) {
    throw new Error("Invalid blockchain specific");
  }

  const chainSpecific = getBlockchainSpecificValue(
    blockchainSpecific,
    blockchainSpecific.case,
  );

  const chainSpecificHandler = handlers[blockchainSpecific.case];

  return chainSpecificHandler({
    ...input,
    chainSpecific,
  });
};
