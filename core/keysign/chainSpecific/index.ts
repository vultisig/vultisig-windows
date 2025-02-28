import {
  ChainSpecificResolver,
  ChainSpecificResolverInput,
} from './ChainSpecificResolver'
import { getCosmosSpecific } from './cosmos'
import { getEthereumSpecific } from './evm'
import {
  chainSpecificRecord,
  KeysignChainSpecific,
  KeysignChainSpecificKey,
} from './KeysignChainSpecific'
import { getMayaSpecific } from './maya'
import { getPolkadotSpecific } from './polkadot'
import { getRippleSpecific } from './ripple'
import { getSolanaSpecific } from './solana'
import { getSuiSpecific } from './sui'
import { getThorchainSpecific } from './thor'
import { getTonSpecific } from './ton'
import { getTronSpecific } from './tron'
import { getUtxoSpecific } from './utxo'

const handlers: Record<KeysignChainSpecificKey, ChainSpecificResolver> = {
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
}

export const getChainSpecific = async (
  input: ChainSpecificResolverInput
): Promise<KeysignChainSpecific> => {
  const chainSpecificCase = chainSpecificRecord[input.coin.chain]

  const value = await handlers[chainSpecificCase](input)

  return {
    case: chainSpecificCase,
    value,
  } as KeysignChainSpecific
}
