import { initWasm, WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import { ChainKey, errorKey } from "utils/constants";

export default class WalletCoreProvider {
  private chainRef?: { [chainKey: string]: CoinType };
  private walletCore?: WalletCore;

  public getCore = (): Promise<{
    chainRef: { [chainKey: string]: CoinType };
    walletCore: WalletCore;
  }> => {
    return new Promise((resolve, reject) => {
      if (this.chainRef && this.walletCore) {
        resolve({ chainRef: this.chainRef, walletCore: this.walletCore });
      } else {
        initWasm()
          .then((walletCore) => {
            this.walletCore = walletCore;

            this.chainRef = {
              [ChainKey.ARBITRUM]: walletCore.CoinType.arbitrum,
              [ChainKey.AVALANCHE]: walletCore.CoinType.avalancheCChain,
              [ChainKey.BASE]: walletCore.CoinType.base,
              [ChainKey.BITCOIN]: walletCore.CoinType.bitcoin,
              [ChainKey.BITCOINCASH]: walletCore.CoinType.bitcoinCash,
              [ChainKey.BLAST]: walletCore.CoinType.blast,
              [ChainKey.BSCCHAIN]: walletCore.CoinType.smartChain,
              [ChainKey.CRONOSCHAIN]: walletCore.CoinType.cronosChain,
              [ChainKey.DASH]: walletCore.CoinType.dash,
              [ChainKey.DOGECOIN]: walletCore.CoinType.dogecoin,
              [ChainKey.DYDX]: walletCore.CoinType.dydx,
              [ChainKey.ETHEREUM]: walletCore.CoinType.ethereum,
              [ChainKey.GAIACHAIN]: walletCore.CoinType.cosmos,
              [ChainKey.KUJIRA]: walletCore.CoinType.kujira,
              [ChainKey.LITECOIN]: walletCore.CoinType.litecoin,
              [ChainKey.MAYACHAIN]: walletCore.CoinType.thorchain,
              [ChainKey.OPTIMISM]: walletCore.CoinType.optimism,
              [ChainKey.OSMOSIS]: walletCore.CoinType.osmosis,
              [ChainKey.POLKADOT]: walletCore.CoinType.polkadot,
              [ChainKey.POLYGON]: walletCore.CoinType.polygon,
              [ChainKey.SOLANA]: walletCore.CoinType.solana,
              [ChainKey.SUI]: walletCore.CoinType.sui,
              [ChainKey.THORCHAIN]: walletCore.CoinType.thorchain,
              [ChainKey.ZKSYNC]: walletCore.CoinType.zksync,
            };

            resolve({ chainRef: this.chainRef, walletCore: this.walletCore });
          })
          .catch(() => {
            reject(errorKey.FAIL_TO_INIT_WASM);
          });
      }
    });
  };
}
