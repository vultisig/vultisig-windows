import { CosmosChain } from '@core/chain/Chain'
import { AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { base64Encode } from '@lib/utils/base64Encode'

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
  Akash: 'https://akash-rest.publicnode.com',
}

export const getCosmosWasmTokenBalanceUrl = ({
  chain,
  id,
  address,
}: AccountCoinKey<CosmosChain>) =>
  `${cosmosRpcUrl[chain]}/cosmwasm/wasm/v1/contract/${id}/smart/${base64Encode(JSON.stringify({ balance: { address } }))}`
