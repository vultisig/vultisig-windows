import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { getKeysignChain } from '../utils/getKeysignChain'
import { SigningInputResolver, signingInputTypes } from './resolver'
import { getCardanoSigningInput } from './resolvers/cardano'
import { getCosmosSigningInput } from './resolvers/cosmos'
import { getEvmSigningInput } from './resolvers/evm'
import { getPolkadotSigningInput } from './resolvers/polkadot'
import { getRippleSigningInput } from './resolvers/ripple'
import { getSolanaSigningInput } from './resolvers/solana'
import { getSuiSigningInput } from './resolvers/sui'
import { getTonSigningInput } from './resolvers/ton'
import { getTronSigningInput } from './resolvers/tron'
import { getUtxoSigningInput } from './resolvers/utxo'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  publicKey?: PublicKey
}

const resolvers: Record<ChainKind, SigningInputResolver<any>> = {
  cardano: getCardanoSigningInput,
  cosmos: getCosmosSigningInput,
  evm: getEvmSigningInput,
  polkadot: getPolkadotSigningInput,
  ripple: getRippleSigningInput,
  solana: getSolanaSigningInput,
  sui: getSuiSigningInput,
  ton: getTonSigningInput,
  utxo: getUtxoSigningInput,
  tron: getTronSigningInput,
} as Record<ChainKind, SigningInputResolver<any>>

export const getEncodedSigningInputs = (input: Input): Uint8Array[] => {
  const chain = getKeysignChain(input.keysignPayload)
  const chainKind = getChainKind(chain)

  const signingInputs = resolvers[chainKind]({
    ...input,
    chain,
  })

  return signingInputs.map(signingInput => {
    const SigningInputClass = signingInputTypes[chainKind]
    return SigningInputClass.encode(signingInput as any).finish()
  })
}
