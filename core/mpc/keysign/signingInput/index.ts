import { ChainKind, ChainOfKind, getChainKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { getKeysignChain } from '../utils/getKeysignChain'
import {
  SigningInputResolver,
  SigningInputType,
  signingInputTypes,
} from './resolver'
import { getCardanoSigningInput } from './resolvers/cardano'
import { getCosmosSigningInput } from './resolvers/cosmos'
import { getEvmSigningInput, getEvmSigningInputs } from './resolvers/evm'
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

export const getSigningInput = <T extends ChainKind>(
  input: Input
): SigningInputType<T> => {
  const { blockchainSpecific } = input.keysignPayload
  if (!blockchainSpecific.case) {
    throw new Error('Invalid blockchain specific')
  }

  const chain = getKeysignChain(input.keysignPayload)
  const chainKind = getChainKind(chain)

  return resolvers[chainKind]({
    ...input,
    chain,
  }) as SigningInputType<T>
}

export const getSigningInputs = <T extends ChainKind>(
  input: Input
): SigningInputType<T>[] => {
  const chain = getKeysignChain(input.keysignPayload)
  const chainKind = getChainKind(chain)

  if (chainKind === 'evm') {
    return getEvmSigningInputs({
      keysignPayload: input.keysignPayload,
      walletCore: input.walletCore,
      chain: chain as ChainOfKind<'evm'>,
      ...(input.publicKey ? { publicKey: input.publicKey } : {}),
    }) as SigningInputType<T>[]
  }

  return [getSigningInput(input)]
}

export const encodeSigningInput = <T extends ChainKind>(
  signingInput: SigningInputType<T>,
  chainKind: T
): Uint8Array => {
  const SigningInputClass = signingInputTypes[chainKind]
  return SigningInputClass.encode(signingInput as any).finish()
}
