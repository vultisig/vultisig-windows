import { Chain } from "./chain";

export type CoinMeta = {
    chain: Chain;
    ticker: string;
    logo: string;
    decimals: number;
    contractAddress: string;
    isNativeToken: boolean;
    priceProviderId: string;
}

