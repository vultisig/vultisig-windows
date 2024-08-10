import { WalletCore } from "@trustwallet/wallet-core";
import { Coin } from "../gen/vultisig/keysign/v1/coin_pb";
import { CoinMeta } from "../model/coin-meta";
import { Chain } from "../model/chain";
import PublicKeyHelper from "./public-key-helper";

export class CoinFactory {
    private walletCore: WalletCore;

    constructor(walletCore: WalletCore) {
        this.walletCore = walletCore;
    }

    async createCoin(asset: CoinMeta, publicKeyECDSA: string, publicKeyEdDSA: string): Promise<Coin> {
        const publicKey = await this.getPublicKey(asset, publicKeyECDSA, publicKeyEdDSA);
        let address;
        switch (asset.chain) {
            case Chain.MayaChain:
                address = this.walletCore.AnyAddress.createBech32(publicKey, this.walletCore.CoinType.thorchain, "maya");
                break;
            default:
                const coinType = this.getCoinType(asset.chain);
                address = coinType.deriveAddressFromPublicKey(publicKey);
                break;
        }
        return new Coin({
            chain: asset.chain.toString(),
            ticker: asset.ticker,
            address: address,
            contractAddress: asset.contractAddress,
            decimals: asset.decimals,
            priceProviderId: asset.priceProviderId,
            isNativeToken: asset.isNativeToken,
            hexPublicKey: publicKey.data.toString('hex'),
            logo: asset.logo
        });
    }

    async getPublicKey(asset: CoinMeta, publicKeyECDSA: string, publicKeyEdDSA: string): Promise<any> {
        switch (asset.chain) {
            case Chain.Polkadot, Chain.Solana:
                return this.walletCore.PublicKey.createWithData(Buffer.from(publicKeyEdDSA, 'hex'), this.walletCore.PublicKeyType.ed25519);
            default:
                let coinType = this.getCoinType(asset.chain);
                const childPublicKey = await PublicKeyHelper.getDerivedPubKey(publicKeyECDSA, publicKeyEdDSA, this.walletCore.CoinTypeExt.derivationPath(coinType));
                return this.walletCore.PublicKey.createWithData(Buffer.from(childPublicKey, 'hex'), this.walletCore.PublicKeyType.secp256k1);
        }
    }

    getCoinType(chain: Chain): any {
        switch (chain) {
            case Chain.THORChain:
                return this.walletCore.CoinType.thorchain;
            case Chain.MayaChain:
                return this.walletCore.CoinType.thorchain;
            case Chain.Arbitrum:
                return this.walletCore.CoinType.arbitrum;
            case Chain.Avalanche:
                return this.walletCore.CoinType.avalancheCChain;
            case Chain.Base:
                return this.walletCore.CoinType.base;
            case Chain.CronosChain:
                return this.walletCore.CoinType.cronosChain;
            case Chain.BSC:
                return this.walletCore.CoinType.smartChain;
            case Chain.Blast:
                return this.walletCore.CoinType.blast;
            case Chain.Ethereum:
                return this.walletCore.CoinType.ethereum;
            case Chain.Optimism:
                return this.walletCore.CoinType.optimism;
            case Chain.Polygon:
                return this.walletCore.CoinType.polygon;
            case Chain.Bitcoin:
                return this.walletCore.CoinType.bitcoin;
            case Chain.BitcoinCash:
                return this.walletCore.CoinType.bitcoinCash;
            case Chain.Litecoin:
                return this.walletCore.CoinType.litecoin;
            case Chain.Dogecoin:
                return this.walletCore.CoinType.dogecoin;
            case Chain.Dash:
                return this.walletCore.CoinType.dash;
            case Chain.Solana:
                return this.walletCore.CoinType.solana;
            case Chain.Gaia:
                return this.walletCore.CoinType.cosmos;
            case Chain.Kujira:
                return this.walletCore.CoinType.kujira;
            case Chain.Dydx:
                return this.walletCore.CoinType.dydx;
            case Chain.Polkadot:
                return this.walletCore.CoinType.polkadot;
        }
    }
}