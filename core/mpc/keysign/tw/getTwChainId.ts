import { Chain } from '@core/chain/Chain'
import { hyperliquid } from '@core/chain/chains/evm/chainInfo'
import { getCoinType } from '@core/chain/coin/coinType'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  walletCore: WalletCore
  chain: Chain
}

export const getTwChainId = ({ walletCore, chain }: Input) => {
  if (chain === Chain.MayaChain) {
    return 'mayachain-mainnet-v1'
  }

  if (chain === Chain.Hyperliquid) {
    return hyperliquid.id.toString()
  }

  const coinType = getCoinType({
    walletCore,
    chain,
  })

  return walletCore.CoinTypeExt.chainId(coinType)
}
