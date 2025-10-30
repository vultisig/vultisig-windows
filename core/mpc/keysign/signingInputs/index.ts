import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { getKeysignChain } from '../utils/getKeysignChain'
import { signingInputClasses } from './core'
import { SigningInputsResolver } from './resolver'
import { getCardanoSigningInputs } from './resolvers/cardano'
import { getCosmosSigningInputs } from './resolvers/cosmos'
import { getEvmSigningInputs } from './resolvers/evm'
import { getPolkadotSigningInputs } from './resolvers/polkadot'
import { getRippleSigningInputs } from './resolvers/ripple'
import { getSolanaSigningInputs } from './resolvers/solana'
import { getSuiSigningInputs } from './resolvers/sui'
import { getTonSigningInputs } from './resolvers/ton'
import { getTronSigningInputs } from './resolvers/tron'
import { getUtxoSigningInputs } from './resolvers/utxo'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  publicKey?: PublicKey
}

const resolvers: Record<ChainKind, SigningInputsResolver<any>> = {
  cardano: getCardanoSigningInputs,
  cosmos: getCosmosSigningInputs,
  evm: getEvmSigningInputs,
  polkadot: getPolkadotSigningInputs,
  ripple: getRippleSigningInputs,
  solana: getSolanaSigningInputs,
  sui: getSuiSigningInputs,
  ton: getTonSigningInputs,
  utxo: getUtxoSigningInputs,
  tron: getTronSigningInputs,
} as Record<ChainKind, SigningInputsResolver<any>>

export const getEncodedSigningInputs = (input: Input): Uint8Array[] => {
  const chain = getKeysignChain(input.keysignPayload)
  const chainKind = getChainKind(chain)

  const signingInputs = resolvers[chainKind](input as any)

  return signingInputs.map(signingInput => {
    const SigningInputClass = signingInputClasses[chainKind]
    return SigningInputClass.encode(signingInput).finish()
  })
}
