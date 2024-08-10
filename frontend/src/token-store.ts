import { Chain } from "./model/chain";
import { CoinMeta } from "./model/coin-meta";

class Token {
    static bitcoin: CoinMeta = {
        chain: Chain.Bitcoin,
        ticker: "BTC",
        logo: "btc",
        decimals: 8,
        priceProviderId: "bitcoin",
        contractAddress: "",
        isNativeToken: true
    };

    static bitcoinCash: CoinMeta = {
        chain: Chain.BitcoinCash,
        ticker: "BCH",
        logo: "bch",
        decimals: 8,
        priceProviderId: "bitcoin-cash",
        contractAddress: "",
        isNativeToken: true
    };

    static litecoin: CoinMeta = {
        chain: Chain.Litecoin,
        ticker: "LTC",
        logo: "ltc",
        decimals: 8,
        priceProviderId: "litecoin",
        contractAddress: "",
        isNativeToken: true
    };

    static dogecoin: CoinMeta = {
        chain: Chain.Dogecoin,
        ticker: "DOGE",
        logo: "doge",
        decimals: 8,
        priceProviderId: "dogecoin",
        contractAddress: "",
        isNativeToken: true
    };

    static dash: CoinMeta = {
        chain: Chain.Dash,
        ticker: "DASH",
        logo: "dash",
        decimals: 8,
        priceProviderId: "dash",
        contractAddress: "",
        isNativeToken: true
    };

    static thorChain: CoinMeta = {
        chain: Chain.THORChain,
        ticker: "RUNE",
        logo: "rune",
        decimals: 8,
        priceProviderId: "thorchain",
        contractAddress: "",
        isNativeToken: true
    };

    static mayaChainCacao: CoinMeta = {
        chain: Chain.MayaChain,
        ticker: "CACAO",
        logo: "cacao",
        decimals: 10,
        priceProviderId: "cacao",
        contractAddress: "",
        isNativeToken: true
    };

    static mayaChainMaya: CoinMeta = {
        chain: Chain.MayaChain,
        ticker: "MAYA",
        logo: "maya",
        decimals: 4,
        priceProviderId: "maya",
        contractAddress: "",
        isNativeToken: false
    };

    static ethereum: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "ETH",
        logo: "eth",
        decimals: 18,
        priceProviderId: "ethereum",
        contractAddress: "",
        isNativeToken: true
    };

    static ethereumUsdc: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "USDC",
        logo: "usdc",
        decimals: 6,
        priceProviderId: "usd-coin",
        contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        isNativeToken: false
    };

    static ethereumUsdt: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "USDT",
        logo: "usdt",
        decimals: 6,
        priceProviderId: "tether",
        contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        isNativeToken: false
    };

    static ethereumUni: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "UNI",
        logo: "uni",
        decimals: 18,
        priceProviderId: "uniswap",
        contractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        isNativeToken: false
    };

    static ethereumMatic: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "MATIC",
        logo: "matic",
        decimals: 18,
        priceProviderId: "matic-network",
        contractAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
        isNativeToken: false
    };

    static ethereumWbtc: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "WBTC",
        logo: "wbtc",
        decimals: 8,
        priceProviderId: "wrapped-bitcoin",
        contractAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        isNativeToken: false
    };

    static ethereumLink: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "LINK",
        logo: "link",
        decimals: 18,
        priceProviderId: "chainlink",
        contractAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
        isNativeToken: false
    };

    static ethereumFlip: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "FLIP",
        logo: "flip",
        decimals: 18,
        priceProviderId: "chainflip",
        contractAddress: "0x826180541412d574cf1336d22c0c0a287822678a",
        isNativeToken: false
    };

    static ethereumTgt: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "TGT",
        logo: "tgt",
        decimals: 18,
        priceProviderId: "thorwallet",
        contractAddress: "0x108a850856Db3f85d0269a2693D896B394C80325",
        isNativeToken: false
    };

    static ethereumFox: CoinMeta = {
        chain: Chain.Ethereum,
        ticker: "FOX",
        logo: "fox",
        decimals: 18,
        priceProviderId: "shapeshift-fox-token",
        contractAddress: "0xc770eefad204b5180df6a14ee197d99d808ee52d",
        isNativeToken: false
    };

    static solana: CoinMeta = {
        chain: Chain.Solana,
        ticker: "SOL",
        logo: "solana",
        decimals: 9,
        priceProviderId: "solana",
        contractAddress: "",
        isNativeToken: true
    };

    static avalanche: CoinMeta = {
        chain: Chain.Avalanche,
        ticker: "AVAX",
        logo: "avax",
        decimals: 18,
        priceProviderId: "avalanche-2",
        contractAddress: "",
        isNativeToken: true
    };

    static avalancheUsdc: CoinMeta = {
        chain: Chain.Avalanche,
        ticker: "USDC",
        logo: "usdc",
        decimals: 6,
        priceProviderId: "usd-coin",
        contractAddress: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
        isNativeToken: false
    };

    static bscChainBnb: CoinMeta = {
        chain: Chain.BSC,
        ticker: "BNB",
        logo: "bsc",
        decimals: 18,
        priceProviderId: "binancecoin",
        contractAddress: "",
        isNativeToken: true
    };

    static bscChainUsdt: CoinMeta = {
        chain: Chain.BSC,
        ticker: "USDT",
        logo: "usdt",
        decimals: 18,
        priceProviderId: "tether",
        contractAddress: "0x55d398326f99059fF775485246999027B3197955",
        isNativeToken: false
    };

    static bscChainUsdc: CoinMeta = {
        chain: Chain.BSC,
        ticker: "USDC",
        logo: "usdc",
        decimals: 18,
        priceProviderId: "usd-coin",
        contractAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        isNativeToken: false
    };

    static gaiaChainAtom: CoinMeta = {
        chain: Chain.Gaia,
        ticker: "ATOM",
        logo: "atom",
        decimals: 6,
        priceProviderId: "cosmos",
        contractAddress: "",
        isNativeToken: true
    };

    static kujira: CoinMeta = {
        chain: Chain.Kujira,
        ticker: "KUJI",
        logo: "kuji",
        decimals: 6,
        priceProviderId: "kujira",
        contractAddress: "",
        isNativeToken: true
    };

    static dydx: CoinMeta = {
        chain: Chain.Dydx,
        ticker: "DYDX",
        logo: "dydx",
        decimals: 18,
        priceProviderId: "dydx-chain",
        contractAddress: "",
        isNativeToken: true
    };

    static baseEth: CoinMeta = {
        chain: Chain.Base,
        ticker: "ETH",
        logo: "eth_base",
        decimals: 18,
        priceProviderId: "ethereum",
        contractAddress: "",
        isNativeToken: true
    };

    static baseUsdc: CoinMeta = {
        chain: Chain.Base,
        ticker: "USDC",
        logo: "usdc",
        decimals: 6,
        priceProviderId: "usd-coin",
        contractAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        isNativeToken: false
    };

    static baseWewe: CoinMeta = {
        chain: Chain.Base,
        ticker: "WEWE",
        logo: "wewe",
        decimals: 18,
        priceProviderId: "",
        contractAddress: "0x6b9bb36519538e0C073894E964E90172E1c0B41F",
        isNativeToken: false
    };

    static arbETH: CoinMeta = {
        chain: Chain.Arbitrum,
        ticker: "ETH",
        logo: "eth_arbitrum",
        decimals: 18,
        priceProviderId: "ethereum",
        contractAddress: "",
        isNativeToken: true
    };
    static arbArb: CoinMeta = {
        chain: Chain.Arbitrum,
        ticker: "WEWE",
        logo: "arbitrum",
        decimals: 18,
        priceProviderId: "arbitrum",
        contractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        isNativeToken: false
    };
    
    static arbTGT: CoinMeta = {
        chain: Chain.Optimism,
        ticker: "TGT",
        logo: "tgt",
        decimals: 18,
        priceProviderId: "thorwallet",
        contractAddress: "0x429fEd88f10285E61b12BDF00848315fbDfCC341",
        isNativeToken: false
    };
    
    static arbFox: CoinMeta = {
        chain: Chain.Optimism,
        ticker: "FOX",
        logo: "fox",
        decimals: 18,
        priceProviderId: "shapeshift-fox-token",
        contractAddress: "0xf929de51D91C77E42f5090069E0AD7A09e513c73",
        isNativeToken: false
    };
    
    static optETH: CoinMeta = {
        chain: Chain.Optimism,
        ticker: "ETH",
        logo: "eth_optimism",
        decimals: 18,
        priceProviderId: "ethereum",
        contractAddress: "",
        isNativeToken: true
    };
    
    static optOP: CoinMeta = {
        chain: Chain.Optimism,
        ticker: "OP",
        logo: "optimism",
        decimals: 18,
        priceProviderId: "arbitrum",
        contractAddress: "0x4200000000000000000000000000000000000042",
        isNativeToken: false
    };
    
    static optFox: CoinMeta = {
        chain: Chain.Optimism,
        ticker: "FOX",
        logo: "fox",
        decimals: 18,
        priceProviderId: "shapeshift-fox-token",
        contractAddress: "0xf1a0da3367bc7aa04f8d94ba57b862ff37ced174",
        isNativeToken: false
    };
    
    static matic: CoinMeta = {
        chain: Chain.Polygon,
        ticker: "MATIC",
        logo: "matic",
        decimals: 18,
        priceProviderId: "matic-network",
        contractAddress: "",
        isNativeToken: true
    };
    
    static maticWETH: CoinMeta = {
        chain: Chain.Polygon,
        ticker: "WETH",
        logo: "wETH",
        decimals: 18,
        priceProviderId: "ethereum",
        contractAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        isNativeToken: false
    };
    
    static maticFox: CoinMeta = {
        chain: Chain.Polygon,
        ticker: "FOX",
        logo: "fox",
        decimals: 18,
        priceProviderId: "shapeshift-fox-token",
        contractAddress: "0x65a05db8322701724c197af82c9cae41195b0aa8",
        isNativeToken: false
    };
    
    static blastETH: CoinMeta = {
        chain: Chain.Blast,
        ticker: "ETH",
        logo: "eth_blast",
        decimals: 18,
        priceProviderId: "ethereum",
        contractAddress: "",
        isNativeToken: true
    };
    
    static blastWETH: CoinMeta = {
        chain: Chain.Blast,
        ticker: "WETH",
        logo: "wETH",
        decimals: 18,
        priceProviderId: "ethereum",
        contractAddress: "0x4300000000000000000000000000000000000004",
        isNativeToken: false
    };
    
    static cronosCRO: CoinMeta = {
        chain: Chain.CronosChain,
        ticker: "CRO",
        logo: "cro",
        decimals: 18,
        priceProviderId: "crypto-com-chain",
        contractAddress: "",
        isNativeToken: true
    };
    
    static suiSUI: CoinMeta = {
        chain: Chain.Sui,
        ticker: "SUI",
        logo: "sui",
        decimals: 9,
        priceProviderId: "sui",
        contractAddress: "",
        isNativeToken: true
    };
    
    static dotDOT: CoinMeta = {
        chain: Chain.Polkadot,
        ticker: "DOT",
        logo: "dot",
        decimals: 10,
        priceProviderId: "polkadot",
        contractAddress: "",
        isNativeToken: true
    };
    
    static zksyncETH: CoinMeta = {
        chain: Chain.ZkSync,
        ticker: "ETH",
        logo: "zsync_era",
        decimals: 18,
        priceProviderId: "ethereum",
        contractAddress: "",
        isNativeToken: true
    };
}

export const TokenSelectionAssets: Token[] = [
    Token.bitcoin,
    Token.bitcoinCash,
    Token.litecoin,
    Token.dogecoin,
    Token.dash,
    Token.thorChain,
    Token.mayaChainCacao,
    Token.mayaChainMaya,
    Token.ethereum,
    Token.ethereumUsdc,
    Token.ethereumUsdt,
    Token.ethereumUni,
    Token.ethereumMatic,
    Token.ethereumWbtc,
    Token.ethereumLink,
    Token.ethereumFlip,
    Token.ethereumTgt,
    Token.ethereumFox,
    Token.solana,
    Token.avalanche,
    Token.avalancheUsdc,
    Token.bscChainBnb,
    Token.bscChainUsdt,
    Token.bscChainUsdc,
    Token.gaiaChainAtom,
    Token.kujira,
    Token.dydx,
    Token.baseEth,
    Token.baseUsdc,
    Token.baseWewe,
    Token.arbETH,
    Token.arbArb,
    Token.arbFox,
    Token.arbTGT,
    Token.optETH,
    Token.optOP,
    Token.optFox,
    Token.matic,
    Token.maticWETH,
    Token.maticFox,
    Token.blastETH,
    Token.blastWETH,
    Token.cronosCRO,
    Token.suiSUI,
    Token.dotDOT,
    Token.zksyncETH
];