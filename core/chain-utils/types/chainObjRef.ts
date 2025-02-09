import { ChainKey } from "../chains";
import { ChainProps } from "./chainProps";

export interface ChainObjRef {
  [ChainKey.ARBITRUM]: ChainProps;
  [ChainKey.AVALANCHE]: ChainProps;
  [ChainKey.BASE]: ChainProps;
  [ChainKey.BITCOIN]: ChainProps;
  [ChainKey.BITCOINCASH]: ChainProps;
  [ChainKey.BLAST]: ChainProps;
  [ChainKey.BSCCHAIN]: ChainProps;
  [ChainKey.CRONOSCHAIN]: ChainProps;
  [ChainKey.DASH]: ChainProps;
  [ChainKey.DOGECOIN]: ChainProps;
  [ChainKey.DYDX]: ChainProps;
  [ChainKey.ETHEREUM]: ChainProps;
  [ChainKey.GAIACHAIN]: ChainProps;
  [ChainKey.KUJIRA]: ChainProps;
  [ChainKey.LITECOIN]: ChainProps;
  [ChainKey.MAYACHAIN]: ChainProps;
  [ChainKey.OPTIMISM]: ChainProps;
  [ChainKey.OSMOSIS]: ChainProps;
  [ChainKey.POLYGON]: ChainProps;
  [ChainKey.SOLANA]: ChainProps;
  [ChainKey.THORCHAIN]: ChainProps;
}
