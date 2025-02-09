import { ChainKey } from "../chains";

export interface ChainStrRef {
  [ChainKey.ARBITRUM]: string;
  [ChainKey.AVALANCHE]: string;
  [ChainKey.BASE]: string;
  [ChainKey.BITCOIN]: string;
  [ChainKey.BITCOINCASH]: string;
  [ChainKey.BLAST]: string;
  [ChainKey.BSCCHAIN]: string;
  [ChainKey.CRONOSCHAIN]: string;
  [ChainKey.DASH]: string;
  [ChainKey.DOGECOIN]: string;
  [ChainKey.DYDX]: string;
  [ChainKey.ETHEREUM]: string;
  [ChainKey.GAIACHAIN]: string;
  [ChainKey.KUJIRA]: string;
  [ChainKey.LITECOIN]: string;
  [ChainKey.MAYACHAIN]: string;
  [ChainKey.OPTIMISM]: string;
  [ChainKey.OSMOSIS]: string;
  [ChainKey.POLKADOT]: string;
  [ChainKey.POLYGON]: string;
  [ChainKey.SOLANA]: string;
  [ChainKey.SUI]: string;
  [ChainKey.THORCHAIN]: string;
  [ChainKey.TERRA]: string;
  [ChainKey.TERRACLASSIC]: string;
  [ChainKey.TON]: string;
  [ChainKey.XRP]: string;
  [ChainKey.ZKSYNC]: string;
}
