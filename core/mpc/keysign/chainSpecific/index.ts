import {
  chainSpecificRecord,
  KeysignChainSpecific,
  KeysignChainSpecificKey,
} from './KeysignChainSpecific'
import { ChainSpecificResolver, ChainSpecificResolverInput } from './resolver'
import { getCardanoSpecific } from './resolvers/cardano'
import { getCosmosSpecific } from './resolvers/cosmos'
import { getEthereumSpecific } from './resolvers/evm'
import { getMayaSpecific } from './resolvers/maya'
import { getPolkadotSpecific } from './resolvers/polkadot'
import { getRippleSpecific } from './resolvers/ripple'
import { getSolanaSpecific } from './resolvers/solana'
import { getSuiSpecific } from './resolvers/sui'
import { getThorchainSpecific } from './resolvers/thor'
import { getTonSpecific } from './resolvers/ton'
import { getTronSpecific } from './resolvers/tron'
import { getUtxoSpecific } from './resolvers/utxo'

const resolvers: Record<KeysignChainSpecificKey, ChainSpecificResolver> = {
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
  tronSpecific: getTronSpecific,
  cardano: getCardanoSpecific,
}

export const getChainSpecific = async (
  input: ChainSpecificResolverInput
): Promise<KeysignChainSpecific> => {
  const chainSpecificCase = chainSpecificRecord[input.coin.chain]
  const value = await resolvers[chainSpecificCase](input)

  return {
    case: chainSpecificCase,
    value,
  } as KeysignChainSpecific
}
