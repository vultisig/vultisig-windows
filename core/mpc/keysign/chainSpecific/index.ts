import { getKeysignCoin } from '../utils/getKeysignCoin'
import {
  chainSpecificRecord,
  KeysignChainSpecific,
} from './KeysignChainSpecific'
import { GetChainSpecificInput, GetChainSpecificResolver } from './resolver'
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

export const getChainSpecific = async (
  input: GetChainSpecificInput
): Promise<KeysignChainSpecific> => {
  const { keysignPayload } = input
  const coin = getKeysignCoin(keysignPayload)
  const chainSpecificCase = chainSpecificRecord[coin.chain]
  const value = await resolvers[chainSpecificCase](input)

  return { case: chainSpecificCase, value } as KeysignChainSpecific
}
