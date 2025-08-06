import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'
import { BlockaidSupportedChains } from '@core/chain/security/blockaid/chains'
import { BlockaidTxScanInput } from '@core/chain/security/blockaid/tx/scan/resolver'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'

import {
  BlockaidTxScanInputOptions,
  BlockaidTxScanInputResolver,
} from './BlockaidTxScanInputResolver'
import { getEvmBlockaidTxScanInput } from './evm'
import { getSolanaBlockaidTxScanInput } from './solana'

const resolvers: Record<
  DeriveChainKind<BlockaidSupportedChains>,
  BlockaidTxScanInputResolver<any>
> = {
  evm: getEvmBlockaidTxScanInput,
  solana: getSolanaBlockaidTxScanInput,
}

export const getBlockaidTxScanInput = ({
  payload,
  walletCore,
}: BlockaidTxScanInputOptions): BlockaidTxScanInput | null => {
  const chain = getKeysignChain(payload)
  const chainKind = getChainKind(chain)

  const resolver =
    resolvers[chainKind as DeriveChainKind<BlockaidSupportedChains>]
  if (!resolver) {
    return null
  }

  return resolver({ payload, walletCore, chain })
}
