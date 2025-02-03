import { WalletCore } from '@trustwallet/wallet-core';

import { KeysignPayload } from '@core/communication/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../../model/chain';
import {
  getBlockchainSpecificValue,
  KeysignChainSpecificKey,
} from '../KeysignChainSpecific';
import { getCosmosPreSignedInputData } from './getCosmosPreSignedInputData';
import { getEvmPreSignedInputData } from './getEvmPreSignedInputData';
import { getMayaPreSignedInputData } from './getMayaPreSignedInputData';
import { getPolkadotPreSignedInputData } from './getPolkadotPreSignedInputData';
import { GetPreSignedInputDataInput } from './GetPreSignedInputDataInput';
import { getRipplePreSignedInputData } from './getRipplePreSignedInputData';
import { getSolanaPreSignedInputData } from './getSolanaPreSignedInputData';
import { getSuiPreSignedInputData } from './getSuiPreSignedInputData';
import { getThorPreSignedInputData } from './getThorPreSignedInputData';
import { getTonPreSignedInputData } from './getTonPreSignedInputData';
import { getUtxoPreSignedInputData } from './getUtxoPreSignedInputData';

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
    throw new Error('Tron is not supported');
  },
};

export const getPreSignedInputData = (input: Input) => {
  const { blockchainSpecific } = input.keysignPayload;
  if (!blockchainSpecific.case) {
    throw new Error('Invalid blockchain specific');
  }

  const chainSpecific = getBlockchainSpecificValue(
    blockchainSpecific,
    blockchainSpecific.case
  );

  const chainSpecificHandler = handlers[blockchainSpecific.case];

  return chainSpecificHandler({
    ...input,
    chainSpecific,
  });
};
