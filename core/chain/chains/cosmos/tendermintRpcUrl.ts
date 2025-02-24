import { CosmosChain } from '@core/chain/Chain'

export const tendermintRpcUrl: Record<CosmosChain, string> = {
  Cosmos: 'https://cosmos-rpc.publicnode.com:443',
  Osmosis: 'https://osmosis-rpc.publicnode.com:443',
  Dydx: 'https://dydx-rpc.publicnode.com:443',
  Kujira: 'https://kujira-rpc.publicnode.com:443',
  Terra: 'https://terra-rpc.publicnode.com:443',
  TerraClassic: 'https://terra-classic-rpc.publicnode.com:443',
  Noble: 'https://noble-rpc.polkachu.com/',
  THORChain: 'https://rpc.ninerealms.com',
  MayaChain: 'https://tendermint.mayachain.info',
  Akash: 'https://akash-rpc.publicnode.com:443',
}
