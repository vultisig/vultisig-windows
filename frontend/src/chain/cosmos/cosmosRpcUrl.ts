import { CosmosChain } from '../../model/chain';
import { ChainAccount } from '../ChainAccount';

export const cosmosRpcUrl: Record<CosmosChain, string> = {
  Cosmos: 'https://cosmos-rest.publicnode.com',
  Osmosis: 'https://osmosis-rest.publicnode.com',
  Dydx: 'https://dydx-rest.publicnode.com',
  Kujira: 'https://kujira-rest.publicnode.com',
  Terra: 'https://terra-lcd.publicnode.com',
  TerraClassic: 'https://terra-classic-lcd.publicnode.com',
  Noble: 'https://noble-api.polkachu.com',
  THORChain: 'https://thornode.ninerealms.com',
  MayaChain: 'https://mayanode.mayachain.info',
};

export const getCosmosTxBroadcastUrl = (chain: CosmosChain) =>
  `${cosmosRpcUrl[chain]}/cosmos/tx/v1beta1/txs`;

export const getCosmosBalanceUrl = ({
  chain,
  address,
}: ChainAccount<CosmosChain>) =>
  `${cosmosRpcUrl[chain]}/cosmos/bank/v1beta1/balances/${address}`;
