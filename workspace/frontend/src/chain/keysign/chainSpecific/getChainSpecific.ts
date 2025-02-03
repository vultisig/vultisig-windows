import { assertChainField } from '../../utils/assertChainField';
import {
  chainSpecificRecord,
  KeysignChainSpecific,
  KeysignChainSpecificKey,
  KeysignChainSpecificValue,
} from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';
import { getCosmosSpecific } from './getCosmosSpecific';
import { getEthereumSpecific } from './getEthereumSpecific';
import { getMayaSpecific } from './getMayaSpecific';
import { getPolkadotSpecific } from './getPolkadotSpecific';
import { getRippleSpecific } from './getRippleSpecific';
import { getSolanaSpecific } from './getSolanaSpecific';
import { getSuiSpecific } from './getSuiSpecific';
import { getThorchainSpecific } from './getThorchainSpecific';
import { getTonSpecific } from './getTonSpecific';
import { getUtxoSpecific } from './getUtxoSpecific';

const handlers: Record<
  KeysignChainSpecificKey,
  (input: GetChainSpecificInput) => Promise<KeysignChainSpecificValue>
> = {
  ethereumSpecific: getEthereumSpecific,
  utxoSpecific: getUtxoSpecific,
  thorchainSpecific: getThorchainSpecific,
  mayaSpecific: getMayaSpecific,
  cosmosSpecific: getCosmosSpecific,
  solanaSpecific: getSolanaSpecific,
  rippleSpecific: getRippleSpecific,
  polkadotSpecific: getPolkadotSpecific,
  suicheSpecific: getSuiSpecific,
  tonSpecific: getTonSpecific,
  tronSpecific: () => {
    throw new Error('Tron is not supported');
  },
};

export const getChainSpecific = async (
  input: GetChainSpecificInput
): Promise<KeysignChainSpecific> => {
  const { chain } = assertChainField(input.coin);

  const chainSpecificCase = chainSpecificRecord[chain];

  const value = await handlers[chainSpecificCase](input);

  return {
    case: chainSpecificCase,
    value,
  } as KeysignChainSpecific;
};
