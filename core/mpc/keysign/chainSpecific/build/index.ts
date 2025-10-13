import { Chain } from '@core/chain/Chain'

import {
  chainSpecificRecord,
  KeysignChainSpecific,
} from '../KeysignChainSpecific'
import { BuildChainSpecificInput, BuildChainSpecificResolver } from './resolver'
import { buildCardanoSpecific } from './resolvers/cardano'
import { buildCosmosSpecific } from './resolvers/cosmos'
import { buildEthereumSpecific } from './resolvers/evm'
import { buildMayaSpecific } from './resolvers/maya'
import { buildPolkadotSpecific } from './resolvers/polkadot'
import { buildRippleSpecific } from './resolvers/ripple'
import { buildSolanaSpecific } from './resolvers/solana'
import { buildSuiSpecific } from './resolvers/sui'
import { buildThorchainSpecific } from './resolvers/thor'
import { buildTonSpecific } from './resolvers/ton'
import { buildTronSpecific } from './resolvers/tron'
import { buildUtxoSpecific } from './resolvers/utxo'

const resolvers: Record<
  KeysignChainSpecific['case'],
  BuildChainSpecificResolver<any>
> = {
  ethereumSpecific: buildEthereumSpecific,
  utxoSpecific: buildUtxoSpecific,
  thorchainSpecific: buildThorchainSpecific,
  mayaSpecific: buildMayaSpecific,
  cosmosSpecific: buildCosmosSpecific,
  solanaSpecific: buildSolanaSpecific,
  rippleSpecific: buildRippleSpecific,
  polkadotSpecific: buildPolkadotSpecific,
  suicheSpecific: buildSuiSpecific,
  tonSpecific: buildTonSpecific,
  tronSpecific: buildTronSpecific,
  cardano: buildCardanoSpecific,
}

export const buildChainSpecific = (
  input: BuildChainSpecificInput<Chain>
): KeysignChainSpecific => {
  const chainSpecificCase = chainSpecificRecord[input.chain]
  const value = resolvers[chainSpecificCase](input)

  return { case: chainSpecificCase, value } as KeysignChainSpecific
}
