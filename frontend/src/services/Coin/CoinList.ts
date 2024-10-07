import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';

export class TokensStore {
  static Token = {
    bitcoin: (): CoinMeta => ({
      chain: Chain.Bitcoin,
      ticker: 'BTC',
      logo: 'btc',
      decimals: 8,
      priceProviderId: 'bitcoin',
      contractAddress: '',
      isNativeToken: true,
    }),

    bitcoinCash: (): CoinMeta => ({
      chain: Chain.BitcoinCash,
      ticker: 'BCH',
      logo: 'bch',
      decimals: 8,
      priceProviderId: 'bitcoin-cash',
      contractAddress: '',
      isNativeToken: true,
    }),

    litecoin: (): CoinMeta => ({
      chain: Chain.Litecoin,
      ticker: 'LTC',
      logo: 'ltc',
      decimals: 8,
      priceProviderId: 'litecoin',
      contractAddress: '',
      isNativeToken: true,
    }),

    dogecoin: (): CoinMeta => ({
      chain: Chain.Dogecoin,
      ticker: 'DOGE',
      logo: 'doge',
      decimals: 8,
      priceProviderId: 'dogecoin',
      contractAddress: '',
      isNativeToken: true,
    }),

    dash: (): CoinMeta => ({
      chain: Chain.Dash,
      ticker: 'DASH',
      logo: 'dash',
      decimals: 8,
      priceProviderId: 'dash',
      contractAddress: '',
      isNativeToken: true,
    }),

    thorChain: (): CoinMeta => ({
      chain: Chain.THORChain,
      ticker: 'RUNE',
      logo: 'rune',
      decimals: 8,
      priceProviderId: 'thorchain',
      contractAddress: '',
      isNativeToken: true,
    }),

    mayaChainCacao: (): CoinMeta => ({
      chain: Chain.MayaChain,
      ticker: 'CACAO',
      logo: 'cacao',
      decimals: 10,
      priceProviderId: 'cacao',
      contractAddress: '',
      isNativeToken: true,
    }),

    mayaChainMaya: (): CoinMeta => ({
      chain: Chain.MayaChain,
      ticker: 'MAYA',
      logo: 'maya',
      decimals: 4,
      priceProviderId: 'maya',
      contractAddress: '',
      isNativeToken: false,
    }),

    solana: (): CoinMeta => ({
      chain: Chain.Solana,
      ticker: 'SOL',
      logo: 'solana',
      decimals: 9,
      priceProviderId: 'solana',
      contractAddress: '',
      isNativeToken: true,
    }),

    solanaJup: (): CoinMeta => ({
      chain: Chain.Solana,
      ticker: 'JUP',
      logo: 'https://static.jup.ag/jup/icon.png',
      decimals: 6,
      priceProviderId: 'jupiter-exchange-solana',
      contractAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      isNativeToken: false,
    }),

    ethereum: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'ETH',
      logo: 'eth',
      decimals: 18,
      priceProviderId: 'ethereum',
      contractAddress: '',
      isNativeToken: true,
    }),

    ethereumUsdc: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'usd-coin',
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      isNativeToken: false,
    }),

    ethereumUsdt: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      priceProviderId: 'tether',
      contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      isNativeToken: false,
    }),

    ethereumUni: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'UNI',
      logo: 'uni',
      decimals: 18,
      priceProviderId: 'uniswap',
      contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      isNativeToken: false,
    }),

    ethereumMatic: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'MATIC',
      logo: 'matic',
      decimals: 18,
      priceProviderId: 'matic-network',
      contractAddress: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
      isNativeToken: false,
    }),

    ethereumWbtc: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      priceProviderId: 'wrapped-bitcoin',
      contractAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      isNativeToken: false,
    }),

    ethereumLink: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'LINK',
      logo: 'link',
      decimals: 18,
      priceProviderId: 'chainlink',
      contractAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
      isNativeToken: false,
    }),

    ethereumFlip: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'FLIP',
      logo: 'ChainFlip',
      decimals: 18,
      priceProviderId: 'chainflip',
      contractAddress: '0x826180541412d574cf1336d22c0c0a287822678a',
      isNativeToken: false,
    }),

    ethereumTgt: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'TGT',
      logo: 'tgt',
      decimals: 18,
      priceProviderId: 'thorwallet',
      contractAddress: '0x108a850856Db3f85d0269a2693D896B394C80325',
      isNativeToken: false,
    }),

    ethereumFox: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'FOX',
      logo: 'fox',
      decimals: 18,
      priceProviderId: 'shapeshift-fox-token',
      contractAddress: '0xc770eefad204b5180df6a14ee197d99d808ee52d',
      isNativeToken: false,
    }),

    ethereumDai: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      priceProviderId: 'dai',
      contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
      isNativeToken: false,
    }),

    ethereumWeth: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'WETH',
      logo: 'weth',
      decimals: 18,
      priceProviderId: 'weth',
      contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      isNativeToken: false,
    }),

    ethereumYfi: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'YFI',
      logo: 'yfi',
      decimals: 18,
      priceProviderId: 'yearn-finance',
      contractAddress: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
      isNativeToken: false,
    }),

    ethereumAave: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'AAVE',
      logo: 'aave',
      decimals: 18,
      priceProviderId: 'aave',
      contractAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      isNativeToken: false,
    }),

    ethereumComp: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'COMP',
      logo: 'comp',
      decimals: 18,
      priceProviderId: 'compound-governance-token',
      contractAddress: '0xc00e94cb662c3520282e6f5717214004a7f26888',
      isNativeToken: false,
    }),

    ethereumBat: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'BAT',
      logo: 'bat',
      decimals: 18,
      priceProviderId: 'basic-attention-token',
      contractAddress: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
      isNativeToken: false,
    }),

    ethereumSnx: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'SNX',
      logo: 'snx',
      decimals: 18,
      priceProviderId: 'havven',
      contractAddress: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
      isNativeToken: false,
    }),

    ethereumBal: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'BAL',
      logo: 'bal',
      decimals: 18,
      priceProviderId: 'balancer',
      contractAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
      isNativeToken: false,
    }),

    ethereumSushi: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'SUSHI',
      logo: 'sushi',
      decimals: 18,
      priceProviderId: 'sushi',
      contractAddress: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
      isNativeToken: false,
    }),

    ethereumMkr: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'MKR',
      logo: 'mkr',
      decimals: 18,
      priceProviderId: 'maker',
      contractAddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      isNativeToken: false,
    }),

    ethereumKnc: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'KNC',
      logo: 'knc',
      decimals: 18,
      priceProviderId: 'kyber-network-crystal',
      contractAddress: '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202',
      isNativeToken: false,
    }),

    ethereumGrt: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'GRT',
      logo: 'grt',
      decimals: 18,
      priceProviderId: 'the-graph',
      contractAddress: '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
      isNativeToken: false,
    }),

    ethereumPepe: (): CoinMeta => ({
      chain: Chain.Ethereum,
      ticker: 'PEPE',
      logo: 'pepe',
      decimals: 18,
      priceProviderId: 'pepe',
      contractAddress: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
      isNativeToken: false,
    }),

    avalanche: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'AVAX',
      logo: 'avax',
      decimals: 18,
      priceProviderId: 'avalanche-2',
      contractAddress: '',
      isNativeToken: true,
    }),

    avalancheUsdc: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
      isNativeToken: false,
    }),

    avalancheUsdt: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      isNativeToken: false,
    }),

    avalancheBtc: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'BTC.b',
      logo: 'btc',
      decimals: 8,
      priceProviderId: '',
      contractAddress: '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
      isNativeToken: false,
    }),

    avalancheSAvax: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'sAVAX',
      logo: 'savax',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
      isNativeToken: false,
    }),

    avalancheJOE: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'JOE',
      logo: 'joe',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
      isNativeToken: false,
    }),

    avalanchePNG: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'PNG',
      logo: 'png',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x60781C2586D68229fde47564546784ab3fACA982',
      isNativeToken: false,
    }),

    avalancheWAVAX: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'WAVAX',
      logo: 'avax',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      isNativeToken: false,
    }),

    avalancheAAvaUSDC: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'aAvaUSDC',
      logo: 'aave',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
      isNativeToken: false,
    }),

    avalancheBLS: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'BLS',
      logo: 'bls',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x46B9144771Cb3195D66e4EDA643a7493fADCAF9D',
      isNativeToken: false,
    }),

    avalancheCOQ: (): CoinMeta => ({
      chain: Chain.Avalanche,
      ticker: 'COQ',
      logo: 'coq',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x420FcA0121DC28039145009570975747295f2329',
      isNativeToken: false,
    }),

    bscChainBnb: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'BNB',
      logo: 'bsc',
      decimals: 18,
      priceProviderId: 'binancecoin',
      contractAddress: '',
      isNativeToken: true,
    }),

    bscChainUsdt: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x55d398326f99059fF775485246999027B3197955',
      isNativeToken: false,
    }),

    bscChainUsdc: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      isNativeToken: false,
    }),

    bscDai: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
      isNativeToken: false,
    }),

    bscWeth: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'WETH',
      logo: 'weth',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      isNativeToken: false,
    }),

    bscAave: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'AAVE',
      logo: 'aave',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xfb6115445bff7b52feb98650c87f44907e58f802',
      isNativeToken: false,
    }),

    bscComp: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'COMP',
      logo: 'comp',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x52ce071bd9b1c4b00a0b92d298c512478cad67e8',
      isNativeToken: false,
    }),

    bscSushi: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'SUSHI',
      logo: 'sushi',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x947950bcc74888a40ffa2593c5798f11fc9124c4',
      isNativeToken: false,
    }),

    bscKnc: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'KNC',
      logo: 'knc',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xfe56d5892bdffc7bf58f2e84be1b2c32d21c308b',
      isNativeToken: false,
    }),

    bscPepe: (): CoinMeta => ({
      chain: Chain.BSC,
      ticker: 'PEPE',
      logo: 'pepe',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x25d887ce7a35172c62febfd67a1856f20faebb00',
      isNativeToken: false,
    }),

    baseEth: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'ETH',
      logo: 'base',
      decimals: 18,
      priceProviderId: 'ethereum',
      contractAddress: '',
      isNativeToken: true,
    }),

    baseUsdc: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'usd-coin',
      contractAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      isNativeToken: false,
    }),

    baseWewe: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'WEWE',
      logo: 'wewe',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x6b9bb36519538e0C073894E964E90172E1c0B41F',
      isNativeToken: false,
    }),

    baseDai: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      priceProviderId: 'dai',
      contractAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      isNativeToken: false,
    }),

    baseRETH: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'rETH',
      logo: 'reth',
      decimals: 18,
      priceProviderId: 'reth',
      contractAddress: '0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c',
      isNativeToken: false,
    }),

    baseEZETH: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'ezETH',
      logo: 'ezeth',
      decimals: 18,
      priceProviderId: 'ezeth',
      contractAddress: '0x2416092f143378750bb29b79eD961ab195CcEea5',
      isNativeToken: false,
    }),

    basePYTH: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'PYTH',
      logo: 'pyth',
      decimals: 18,
      priceProviderId: 'pyth',
      contractAddress: '0x4c5d8A75F3762c1561D96f177694f67378705E98',
      isNativeToken: false,
    }),

    baseOM: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'OM',
      logo: 'om',
      decimals: 18,
      priceProviderId: 'om',
      contractAddress: '0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98',
      isNativeToken: false,
    }),

    baseW: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'W',
      logo: 'w',
      decimals: 18,
      priceProviderId: 'w',
      contractAddress: '0xB0fFa8000886e57F86dd5264b9582b2Ad87b2b91',
      isNativeToken: false,
    }),

    baseCBETH: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'cbETH',
      logo: 'cbeth',
      decimals: 18,
      priceProviderId: 'cbETH',
      contractAddress: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
      isNativeToken: false,
    }),

    baseSNX: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'SNX',
      logo: 'snx',
      decimals: 18,
      priceProviderId: 'SNX',
      contractAddress: '0x22e6966B799c4D5B13BE962E1D117b56327FDa66',
      isNativeToken: false,
    }),

    baseAERO: (): CoinMeta => ({
      chain: Chain.Base,
      ticker: 'AERO',
      logo: 'aero',
      decimals: 18,
      priceProviderId: 'AERO',
      contractAddress: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
      isNativeToken: false,
    }),

    arbETH: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'ETH',
      logo: 'arbitrum',
      decimals: 18,
      priceProviderId: 'ethereum',
      contractAddress: '',
      isNativeToken: true,
    }),

    arbArb: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'ARB',
      logo: 'arbitrum',
      decimals: 18,
      priceProviderId: 'arbitrum',
      contractAddress: '0x912ce59144191c1204e64559fe8253a0e49e6548',
      isNativeToken: false,
    }),

    arbTGT: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'TGT',
      logo: 'tgt',
      decimals: 18,
      priceProviderId: 'thorwallet',
      contractAddress: '0x429fEd88f10285E61b12BDF00848315fbDfCC341',
      isNativeToken: false,
    }),

    arbFox: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'FOX',
      logo: 'fox',
      decimals: 18,
      priceProviderId: 'shapeshift-fox-token',
      contractAddress: '0xf929de51D91C77E42f5090069E0AD7A09e513c73',
      isNativeToken: false,
    }),

    arbUSDT: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      priceProviderId: 'USDT',
      contractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      isNativeToken: false,
    }),

    arbUSDCe: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'USDC.e',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'USDC.e',
      contractAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      isNativeToken: false,
    }),

    arbUSDC: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'USDC',
      contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      isNativeToken: false,
    }),

    arbWBTC: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      priceProviderId: 'WBTC',
      contractAddress: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      isNativeToken: false,
    }),

    arbLINK: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'LINK',
      logo: 'link',
      decimals: 18,
      priceProviderId: 'LINK',
      contractAddress: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
      isNativeToken: false,
    }),

    arbDAI: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      priceProviderId: 'DAI',
      contractAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      isNativeToken: false,
    }),

    arbUNI: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'UNI',
      logo: 'uni',
      decimals: 18,
      priceProviderId: 'UNI',
      contractAddress: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
      isNativeToken: false,
    }),

    arbPEPE: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'PEPE',
      logo: 'pepe',
      decimals: 18,
      priceProviderId: 'PEPE',
      contractAddress: '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00',
      isNativeToken: false,
    }),

    arbGRT: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'GRT',
      logo: 'grt',
      decimals: 18,
      priceProviderId: 'GRT',
      contractAddress: '0x9623063377AD1B27544C965cCd7342f7EA7e88C7',
      isNativeToken: false,
    }),

    arbEZETH: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'ezETH',
      logo: 'ezeth',
      decimals: 18,
      priceProviderId: 'ezETH',
      contractAddress: '0x2416092f143378750bb29b79eD961ab195CcEea5',
      isNativeToken: false,
    }),

    arbPYTH: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'PYTH',
      logo: 'pyth',
      decimals: 6,
      priceProviderId: 'PYTH',
      contractAddress: '0xE4D5c6aE46ADFAF04313081e8C0052A30b6Dd724',
      isNativeToken: false,
    }),

    arbLDO: (): CoinMeta => ({
      chain: Chain.Arbitrum,
      ticker: 'LDO',
      logo: 'ldo',
      decimals: 18,
      priceProviderId: 'LDO',
      contractAddress: '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60',
      isNativeToken: false,
    }),

    optETH: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'ETH',
      logo: 'optimism',
      decimals: 18,
      priceProviderId: 'ethereum',
      contractAddress: '',
      isNativeToken: true,
    }),

    optOP: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'OP',
      logo: 'optimism',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x4200000000000000000000000000000000000042',
      isNativeToken: false,
    }),

    optFox: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'FOX',
      logo: 'fox',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xf1a0da3367bc7aa04f8d94ba57b862ff37ced174',
      isNativeToken: false,
    }),

    optUSDT: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      isNativeToken: false,
    }),

    optUSDC: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      isNativeToken: false,
    }),

    optUSDCe: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'USDC.e',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      isNativeToken: false,
    }),

    optWBTC: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      priceProviderId: '',
      contractAddress: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      isNativeToken: false,
    }),

    optLINK: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'LINK',
      logo: 'link',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
      isNativeToken: false,
    }),

    optDAI: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      isNativeToken: false,
    }),

    optEZETH: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'ezETH',
      logo: 'ezeth',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x2416092f143378750bb29b79eD961ab195CcEea5',
      isNativeToken: false,
    }),

    optPYTH: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'PYTH',
      logo: 'pyth',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0x99C59ACeBFEF3BBFB7129DC90D1a11DB0E91187f',
      isNativeToken: false,
    }),

    optLDO: (): CoinMeta => ({
      chain: Chain.Optimism,
      ticker: 'LDO',
      logo: 'ldo',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xFdb794692724153d1488CcdBE0C56c252596735F',
      isNativeToken: false,
    }),

    matic: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'MATIC',
      logo: 'matic',
      decimals: 18,
      priceProviderId: 'matic-network',
      contractAddress: '',
      isNativeToken: true,
    }),

    maticWETH: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'WETH',
      logo: 'weth',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      isNativeToken: false,
    }),

    maticFox: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'FOX',
      logo: 'fox',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x65a05db8322701724c197af82c9cae41195b0aa8',
      isNativeToken: false,
    }),

    maticUSDT: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      isNativeToken: false,
    }),

    maticBNB: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'BNB',
      logo: 'bsc',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3',
      isNativeToken: false,
    }),

    maticSOL: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'SOL',
      logo: 'solana',
      decimals: 9,
      priceProviderId: '',
      contractAddress: '0xd93f7E271cB87c23AaA73edC008A79646d1F9912',
      isNativeToken: false,
    }),

    maticUSDC: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      isNativeToken: false,
    }),

    maticUSDCe: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'USDC.e',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: '',
      contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      isNativeToken: false,
    }),

    maticBUSD: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'BUSD',
      logo: 'busd',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7',
      isNativeToken: false,
    }),

    maticWBTC: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      priceProviderId: '',
      contractAddress: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      isNativeToken: false,
    }),

    maticAVAX: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'AVAX',
      logo: 'avax',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b',
      isNativeToken: false,
    }),

    maticSHIB: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'SHIB',
      logo: 'shib',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec',
      isNativeToken: false,
    }),

    maticLINK: (): CoinMeta => ({
      chain: Chain.Polygon,
      ticker: 'LINK',
      logo: 'link',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
      isNativeToken: false,
    }),

    blastETH: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'ETH',
      logo: 'blast',
      decimals: 18,
      priceProviderId: 'ethereum',
      contractAddress: '',
      isNativeToken: true,
    }),

    blastWETH: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'WETH',
      logo: 'weth',
      decimals: 18,
      priceProviderId: 'ethereum',
      contractAddress: '0x4300000000000000000000000000000000000004',
      isNativeToken: false,
    }),

    blastWBTC: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      priceProviderId: '',
      contractAddress: '0xF7bc58b8D8f97ADC129cfC4c9f45Ce3C0E1D2692',
      isNativeToken: false,
    }),

    blastUSDB: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'USDB',
      logo: 'usdb',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x4300000000000000000000000000000000000003',
      isNativeToken: false,
    }),

    blastBLAST: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'BLAST',
      logo: 'blast',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xb1a5700fA2358173Fe465e6eA4Ff52E36e88E2ad',
      isNativeToken: false,
    }),

    blastMIM: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'MIM',
      logo: 'mim',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x76DA31D7C9CbEAE102aff34D3398bC450c8374c1',
      isNativeToken: false,
    }),

    blastBLOOKS: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'bLOOKS',
      logo: 'blooks',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x406F10d635be12ad33D6B133C6DA89180f5B999e',
      isNativeToken: false,
    }),

    blastBAG: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'BAG',
      logo: 'bag',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0xb9dfCd4CF589bB8090569cb52FaC1b88Dbe4981F',
      isNativeToken: false,
    }),

    blastZERO: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'ZERO',
      logo: 'zero',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x357f93E17FdabEcd3fEFc488a2d27dff8065d00f',
      isNativeToken: false,
    }),

    blastAI: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'AI',
      logo: 'anyinu',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x764933fbAd8f5D04Ccd088602096655c2ED9879F',
      isNativeToken: false,
    }),

    blastJUICE: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'JUICE',
      logo: 'juice',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x818a92bc81Aad0053d72ba753fb5Bc3d0C5C0923',
      isNativeToken: false,
    }),

    blastOMNI: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'OMNI',
      logo: 'omni',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x9e20461bc2c4c980f62f1B279D71734207a6A356',
      isNativeToken: false,
    }),

    blastDACKIE: (): CoinMeta => ({
      chain: Chain.Blast,
      ticker: 'DACKIE',
      logo: 'dackie',
      decimals: 18,
      priceProviderId: '',
      contractAddress: '0x47C337Bd5b9344a6F3D6f58C474D9D8cd419D8cA',
      isNativeToken: false,
    }),

    cronosCRO: (): CoinMeta => ({
      chain: Chain.CronosChain,
      ticker: 'CRO',
      logo: 'cro',
      decimals: 18,
      priceProviderId: 'crypto-com-chain',
      contractAddress: '',
      isNativeToken: true,
    }),

    suiSUI: (): CoinMeta => ({
      chain: Chain.Sui,
      ticker: 'SUI',
      logo: 'sui',
      decimals: 9,
      priceProviderId: 'sui',
      contractAddress: '',
      isNativeToken: true,
    }),

    dotDOT: (): CoinMeta => ({
      chain: Chain.Polkadot,
      ticker: 'DOT',
      logo: 'dot',
      decimals: 10,
      priceProviderId: 'polkadot',
      contractAddress: '',
      isNativeToken: true,
    }),

    gaiaChainAtom: (): CoinMeta => ({
      chain: Chain.Cosmos,
      ticker: 'ATOM',
      logo: 'atom',
      decimals: 6,
      priceProviderId: 'cosmos',
      contractAddress: '',
      isNativeToken: true,
    }),

    kujira: (): CoinMeta => ({
      chain: Chain.Kujira,
      ticker: 'KUJI',
      logo: 'kuji',
      decimals: 6,
      priceProviderId: 'kujira',
      contractAddress: '',
      isNativeToken: true,
    }),

    dydx: (): CoinMeta => ({
      chain: Chain.Dydx,
      ticker: 'DYDX',
      logo: 'dydx',
      decimals: 18,
      priceProviderId: 'dydx-chain',
      contractAddress: '',
      isNativeToken: true,
    }),

    zksyncETH: (): CoinMeta => ({
      chain: Chain.Zksync,
      ticker: 'ETH',
      logo: 'zksync',
      decimals: 18,
      priceProviderId: 'ethereum',
      contractAddress: '',
      isNativeToken: true,
    }),
  };

  static TokenSelectionAssets: CoinMeta[] = [
    TokensStore.Token.bitcoin(),
    TokensStore.Token.bitcoinCash(),
    TokensStore.Token.litecoin(),
    TokensStore.Token.dogecoin(),
    TokensStore.Token.dash(),

    TokensStore.Token.thorChain(),

    TokensStore.Token.mayaChainCacao(),
    TokensStore.Token.mayaChainMaya(),

    TokensStore.Token.solana(),
    TokensStore.Token.solanaJup(),

    TokensStore.Token.gaiaChainAtom(),
    TokensStore.Token.kujira(),
    TokensStore.Token.dydx(),

    TokensStore.Token.suiSUI(),

    TokensStore.Token.dotDOT(),

    // START EVMS
    // ETHEREUM
    TokensStore.Token.ethereum(),
    TokensStore.Token.ethereumUsdc(),
    TokensStore.Token.ethereumUsdt(),
    TokensStore.Token.ethereumUni(),
    TokensStore.Token.ethereumMatic(),
    TokensStore.Token.ethereumWbtc(),
    TokensStore.Token.ethereumLink(),
    TokensStore.Token.ethereumFlip(),
    TokensStore.Token.ethereumTgt(),
    TokensStore.Token.ethereumFox(),
    TokensStore.Token.ethereumDai(),
    TokensStore.Token.ethereumWeth(),
    TokensStore.Token.ethereumYfi(),
    TokensStore.Token.ethereumAave(),
    TokensStore.Token.ethereumComp(),
    TokensStore.Token.ethereumBat(),
    TokensStore.Token.ethereumSnx(),
    TokensStore.Token.ethereumBal(),
    TokensStore.Token.ethereumSushi(),
    TokensStore.Token.ethereumMkr(),
    TokensStore.Token.ethereumKnc(),
    TokensStore.Token.ethereumGrt(),
    TokensStore.Token.ethereumPepe(),

    // AVAX
    TokensStore.Token.avalanche(),
    TokensStore.Token.avalancheUsdc(),
    TokensStore.Token.avalancheUsdt(),
    TokensStore.Token.avalancheBtc(),
    TokensStore.Token.avalancheSAvax(),
    TokensStore.Token.avalancheJOE(),
    TokensStore.Token.avalanchePNG(),
    TokensStore.Token.avalancheWAVAX(),
    TokensStore.Token.avalancheAAvaUSDC(),
    TokensStore.Token.avalancheBLS(),
    TokensStore.Token.avalancheCOQ(),

    // BSC
    TokensStore.Token.bscChainBnb(),
    TokensStore.Token.bscChainUsdt(),
    TokensStore.Token.bscChainUsdc(),
    TokensStore.Token.bscDai(),
    TokensStore.Token.bscWeth(),
    TokensStore.Token.bscAave(),
    TokensStore.Token.bscComp(),
    TokensStore.Token.bscSushi(),
    TokensStore.Token.bscKnc(),
    TokensStore.Token.bscPepe(),

    // BASE
    TokensStore.Token.baseEth(),
    TokensStore.Token.baseUsdc(),
    TokensStore.Token.baseWewe(),
    TokensStore.Token.baseDai(),
    TokensStore.Token.baseRETH(),
    TokensStore.Token.baseEZETH(),
    TokensStore.Token.basePYTH(),
    TokensStore.Token.baseOM(),
    TokensStore.Token.baseW(),
    TokensStore.Token.baseCBETH(),
    TokensStore.Token.baseSNX(),
    TokensStore.Token.baseAERO(),

    // ARB
    TokensStore.Token.arbETH(),
    TokensStore.Token.arbArb(),
    TokensStore.Token.arbFox(),
    TokensStore.Token.arbTGT(),
    TokensStore.Token.arbUSDT(),
    TokensStore.Token.arbUSDCe(),
    TokensStore.Token.arbUSDC(),
    TokensStore.Token.arbWBTC(),
    TokensStore.Token.arbLINK(),
    TokensStore.Token.arbDAI(),
    TokensStore.Token.arbUNI(),
    TokensStore.Token.arbPEPE(),
    TokensStore.Token.arbGRT(),
    TokensStore.Token.arbEZETH(),
    TokensStore.Token.arbPYTH(),
    TokensStore.Token.arbLDO(),

    // OPTIMUM
    TokensStore.Token.optETH(),
    TokensStore.Token.optOP(),
    TokensStore.Token.optFox(),
    TokensStore.Token.optUSDT(),
    TokensStore.Token.optUSDCe(),
    TokensStore.Token.optUSDC(),
    TokensStore.Token.optWBTC(),
    TokensStore.Token.optLINK(),
    TokensStore.Token.optDAI(),
    TokensStore.Token.optEZETH(),
    TokensStore.Token.optPYTH(),
    TokensStore.Token.optLDO(),

    // MATIC
    TokensStore.Token.matic(),
    TokensStore.Token.maticWETH(),
    TokensStore.Token.maticFox(),
    TokensStore.Token.maticUSDT(),
    TokensStore.Token.maticBNB(),
    TokensStore.Token.maticSOL(),
    TokensStore.Token.maticUSDC(),
    TokensStore.Token.maticUSDCe(),
    TokensStore.Token.maticBUSD(),
    TokensStore.Token.maticWBTC(),
    TokensStore.Token.maticAVAX(),
    TokensStore.Token.maticSHIB(),
    TokensStore.Token.maticLINK(),

    // BLAST
    TokensStore.Token.blastETH(),
    TokensStore.Token.blastWETH(),
    TokensStore.Token.blastWBTC(),
    TokensStore.Token.blastUSDB(),
    TokensStore.Token.blastBLAST(),
    TokensStore.Token.blastMIM(),
    TokensStore.Token.blastBLOOKS(),
    TokensStore.Token.blastBAG(),
    TokensStore.Token.blastZERO(),
    TokensStore.Token.blastAI(),
    TokensStore.Token.blastJUICE(),
    TokensStore.Token.blastOMNI(),
    TokensStore.Token.blastDACKIE(),

    // CRONOS
    TokensStore.Token.cronosCRO(),

    // ZSYNC
    TokensStore.Token.zksyncETH(),
    // END EVMS
  ];
}
