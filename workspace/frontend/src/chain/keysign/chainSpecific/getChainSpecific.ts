import { match } from '../../../lib/utils/match';
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

export const getChainSpecific = async (
  input: GetChainSpecificInput
): Promise<KeysignChainSpecific> => {
  const { chain } = assertChainField(input.coin);

  const chainSpecificCase = chainSpecificRecord[chain];

  const value = await match<
    KeysignChainSpecificKey,
    Promise<KeysignChainSpecificValue>
  >(chainSpecificCase, {
    ethereumSpecific: () => getEthereumSpecific(input),
    utxoSpecific: () => getUtxoSpecific(input),
    thorchainSpecific: () => getThorchainSpecific(input),
    mayaSpecific: () => getMayaSpecific(input),
    cosmosSpecific: () => getCosmosSpecific(input),
    solanaSpecific: () => getSolanaSpecific(input),
    rippleSpecific: () => getRippleSpecific(input),
    polkadotSpecific: () => getPolkadotSpecific(input),
    suicheSpecific: () => getSuiSpecific(input),
    tonSpecific: () => getTonSpecific(input),
  });

  return {
    case: chainSpecificCase,
    value,
  } as KeysignChainSpecific;
};
