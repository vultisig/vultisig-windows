import { Chain, EvmChain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  walletCore: WalletCore
  chain: EvmChain
}

export const getEvmTwChainId = ({ walletCore, chain }: Input) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const chainId = BigInt(walletCore.CoinTypeExt.chainId(coinType))

  return Buffer.from(
    stripHexPrefix(
      chainId.toString(16).padStart(chain === Chain.Zksync ? 4 : 2, '0')
    ),
    'hex'
  )
}
