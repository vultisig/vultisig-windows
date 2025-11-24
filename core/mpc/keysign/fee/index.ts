import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { getKeysignChain } from '../utils/getKeysignChain'
import { FeeAmountResolver } from './resolver'
import { getCardanoFeeAmount } from './resolvers/cardano'
import { getCosmosFeeAmount } from './resolvers/cosmos'
import { getEvmFeeAmount } from './resolvers/evm'
import { getPolkadotFeeAmount } from './resolvers/polkadot'
import { getRippleFeeAmount } from './resolvers/ripple'
import { getSolanaFeeAmount } from './resolvers/solana'
import { getSuiFeeAmount } from './resolvers/sui'
import { tonFeeAmountResolver } from './resolvers/ton'
import { getTronFeeAmount } from './resolvers/tron'
import { getUtxoFeeAmount } from './resolvers/utxo'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  publicKey: PublicKey
}

const resolvers: Record<ChainKind, FeeAmountResolver> = {
  cardano: getCardanoFeeAmount,
  cosmos: getCosmosFeeAmount,
  evm: getEvmFeeAmount,
  polkadot: getPolkadotFeeAmount,
  ripple: getRippleFeeAmount,
  solana: getSolanaFeeAmount,
  sui: getSuiFeeAmount,
  ton: tonFeeAmountResolver,
  utxo: getUtxoFeeAmount,
  tron: getTronFeeAmount,
}

export const getFeeAmount = (input: Input): bigint => {
  const chain = getKeysignChain(input.keysignPayload)
  const kind = getChainKind(chain)

  return resolvers[kind](input as any)
}
