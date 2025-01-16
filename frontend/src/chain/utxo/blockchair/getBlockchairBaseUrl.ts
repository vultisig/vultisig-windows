import { UtxoChain } from '../../../model/chain';
import { Endpoint } from '../../../services/Endpoint';

export const getBlockchairBaseUrl = (chain: UtxoChain) =>
  `${Endpoint.vultisigApiProxy}/blockchair/${chain.toLowerCase()}`;
