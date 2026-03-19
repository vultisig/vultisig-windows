import { Chain } from '@core/chain/Chain'

import { getKeysignCoin } from '../utils/getKeysignCoin'
import {
  chainSpecificRecord,
  KeysignChainSpecific,
} from './KeysignChainSpecific'
import { GetChainSpecificInput, GetChainSpecificResolver } from './resolver'
import { getBittensorChainSpecific } from './resolvers/bittensor'
import { getCardanoChainSpecific } from './resolvers/cardano'
import { getCosmosChainSpecific } from './resolvers/cosmos'
import { getEvmChainSpecific } from './resolvers/evm'
import { getMayaChainSpecific } from './resolvers/maya'
import { getPolkadotChainSpecific } from './resolvers/polkadot'
import { getRippleChainSpecific } from './resolvers/ripple'
import { getSolanaChainSpecific } from './resolvers/solana'
import { getSuiChainSpecific } from './resolvers/sui'
import { getThorchainChainSpecific } from './resolvers/thor'
import { getTonChainSpecific } from './resolvers/ton'
import { getTronChainSpecific } from './resolvers/tron'
import { getUtxoChainSpecific } from './resolvers/utxo'

const resolvers: Record<
  KeysignChainSpecific['case'],
  GetChainSpecificResolver<any>
> = {
  ethereumSpecific: getEvmChainSpecific,
  utxoSpecific: getUtxoChainSpecific,
  thorchainSpecific: getThorchainChainSpecific,
  mayaSpecific: getMayaChainSpecific,
  cosmosSpecific: getCosmosChainSpecific,
  solanaSpecific: getSolanaChainSpecific,
  rippleSpecific: getRippleChainSpecific,
  polkadotSpecific: getPolkadotChainSpecific,
  suicheSpecific: getSuiChainSpecific,
  tonSpecific: getTonChainSpecific,
  tronSpecific: getTronChainSpecific,
  cardano: getCardanoChainSpecific,
}

// Chains that share a proto case but need their own resolver
const chainOverrides: Partial<
  Record<Chain, GetChainSpecificResolver<any>>
> = {
  [Chain.Bittensor]: getBittensorChainSpecific,
}

export const getChainSpecific = async (
  input: GetChainSpecificInput
): Promise<KeysignChainSpecific> => {
  const { keysignPayload } = input
  const coin = getKeysignCoin(keysignPayload)
  const chainSpecificCase = chainSpecificRecord[coin.chain]
  const resolver = chainOverrides[coin.chain] ?? resolvers[chainSpecificCase]
  const value = await resolver(input)

  return { case: chainSpecificCase, value } as KeysignChainSpecific
}
