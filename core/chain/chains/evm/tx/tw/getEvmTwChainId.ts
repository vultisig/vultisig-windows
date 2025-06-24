import { Chain, EvmChain } from '@core/chain/Chain'
import { getTwChainId } from '@core/mpc/keysign/tw/getTwChainId'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  walletCore: WalletCore
  chain: EvmChain
}

export const getEvmTwChainId = (input: Input) => {
  const chainId = BigInt(getTwChainId(input))

  return Buffer.from(
    stripHexPrefix(
      chainId.toString(16).padStart(input.chain === Chain.Zksync ? 4 : 2, '0')
    ),
    'hex'
  )
}
