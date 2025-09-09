import { EvmChain } from '@core/chain/Chain'
import { getTwChainId } from '@core/mpc/keysign/tw/getTwChainId'
import { numberToEvenHex } from '@lib/utils/hex/numberToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  walletCore: WalletCore
  chain: EvmChain
}

export const getEvmTwChainId = (input: Input) => {
  const chainId = BigInt(getTwChainId(input))

  const evenHex = numberToEvenHex(chainId)
  const hex = stripHexPrefix(evenHex)

  return Buffer.from(hex, 'hex')
}
