import { Chain } from "../../../model/chain";

export class RpcServiceEvmOneInch {
    static getOneInchChainId(chain: Chain): number {
        switch (chain) {
            case Chain.Ethereum:
                return 1;
            case Chain.Avalanche:
                return 43114;
            case Chain.Base:
                return 8453;
            case Chain.Blast:
                return 81457;
            case Chain.Arbitrum:
                return 42161;
            case Chain.Polygon:
                return 137;
            case Chain.Optimism:
                return 10;
            case Chain.BSC:
                return 56;
            case Chain.CronosChain:
                return 25;
            case Chain.ZkSync:
                return 324;
            default:
                return -1;
        }
    }
}