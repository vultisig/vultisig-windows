import { errorKey } from '@clients/extension/src/utils/constants'
import { Chain } from '@core/chain/Chain'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'

// export default class WalletCoreProvider {
//   private chainRef?: { [Chain: string]: CoinType }
//   private walletCore?: WalletCore

//   public getCore = (): Promise<{
//     chainRef: { [Chain: string]: CoinType }
//     walletCore: WalletCore
//   }> => {
//     return new Promise((resolve, reject) => {
//       if (this.chainRef && this.walletCore) {
//         resolve({ chainRef: this.chainRef, walletCore: this.walletCore })
//       } else {
//         initWasm()
//           .then(walletCore => {
//             this.walletCore = walletCore

//             this.chainRef = {
//               [Chain.Arbitrum]: walletCore.CoinType.arbitrum,
//               [Chain.Avalanche]: walletCore.CoinType.avalancheCChain,
//               [Chain.Base]: walletCore.CoinType.base,
//               [Chain.Bitcoin]: walletCore.CoinType.bitcoin,
//               [Chain.BitcoinCash]: walletCore.CoinType.bitcoinCash,
//               [Chain.Blast]: walletCore.CoinType.blast,
//               [Chain.BSC]: walletCore.CoinType.smartChain,
//               [Chain.CronosChain]: walletCore.CoinType.cronosChain,
//               [Chain.Dash]: walletCore.CoinType.dash,
//               [Chain.Dogecoin]: walletCore.CoinType.dogecoin,
//               [Chain.Dydx]: walletCore.CoinType.dydx,
//               [Chain.Ethereum]: walletCore.CoinType.ethereum,
//               [Chain.Cosmos]: walletCore.CoinType.cosmos,
//               [Chain.Kujira]: walletCore.CoinType.kujira,
//               [Chain.Litecoin]: walletCore.CoinType.litecoin,
//               [Chain.MayaChain]: walletCore.CoinType.thorchain,
//               [Chain.Optimism]: walletCore.CoinType.optimism,
//               [Chain.Osmosis]: walletCore.CoinType.osmosis,
//               [Chain.Polkadot]: walletCore.CoinType.polkadot,
//               [Chain.Polygon]: walletCore.CoinType.polygon,
//               [Chain.Solana]: walletCore.CoinType.solana,
//               [Chain.Sui]: walletCore.CoinType.sui,
//               [Chain.THORChain]: walletCore.CoinType.thorchain,
//               [Chain.Zksync]: walletCore.CoinType.zksync,
//             }

//             resolve({ chainRef: this.chainRef, walletCore: this.walletCore })
//           })
//           .catch(() => {
//             reject(errorKey.FAIL_TO_INIT_WASM)
//           })
//       }
//     })
//   }
// }
