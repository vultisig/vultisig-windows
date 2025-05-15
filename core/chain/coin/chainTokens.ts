import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { recordMap } from '@lib/utils/record/recordMap'

import {
  CHAINS_WITH_IBC_TOKENS,
  IBC_TOKENS,
  IBC_TRANSFERRABLE_TOKENS_PER_CHAIN,
} from './ibc'
import { getMissingIBCTokens } from './utils/getMissingIbcTokens'
import { initializeChainTokens } from './utils/initializeChainTokens'
import { patchTokensWithIBCIds } from './utils/patchTokensWithIBCIds'

const leanChainNativeTokens: Partial<Record<Chain, Omit<Coin, 'chain'>[]>> = {
  [Chain.MayaChain]: [
    {
      ticker: 'MAYA',
      logo: 'maya',
      decimals: 4,
      id: 'maya',
    },
  ],
  [Chain.TerraClassic]: [
    {
      ticker: 'USTC',
      logo: 'ustc.png',
      decimals: 6,
      priceProviderId: 'terrausd',
      id: 'uusd',
    },
  ],
}

const leanChainTokens: Partial<Record<Chain, Omit<Coin, 'chain'>[]>> = {
  [Chain.THORChain]: [
    {
      ticker: 'TCY',
      logo: 'tcy.png',
      decimals: 8,
      id: 'tcy',
      priceProviderId: 'tcy',
    },
  ],
  [Chain.Tron]: [
    {
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      priceProviderId: 'tether',
      id: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    },
  ],
  [Chain.Solana]: [
    {
      ticker: 'JUP',
      logo: 'https://static.jup.ag/jup/icon.png',
      decimals: 6,
      priceProviderId: 'jupiter-exchange-solana',
      id: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    },
  ],
  [Chain.Ethereum]: [
    {
      ticker: 'VULT',
      logo: 'vult',
      decimals: 18,
      priceProviderId: '',
      id: '0xb788144DF611029C60b859DF47e79B7726C4DEBa',
    },
    {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'usd-coin',
      id: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      priceProviderId: 'tether',
      id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    },
    {
      ticker: 'UNI',
      logo: 'uni',
      decimals: 18,
      priceProviderId: 'uniswap',
      id: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    },
    {
      ticker: 'MATIC',
      logo: 'matic',
      decimals: 18,
      priceProviderId: 'matic-network',
      id: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    },
    {
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      priceProviderId: 'wrapped-bitcoin',
      id: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    },
    {
      ticker: 'LINK',
      logo: 'link',
      decimals: 18,
      id: '0x514910771af9ca656af840dff83e8264ecf986ca',
    },
    {
      ticker: 'FLIP',
      logo: 'ChainFlip',
      decimals: 18,
      priceProviderId: 'chainflip',
      id: '0x826180541412d574cf1336d22c0c0a287822678a',
    },
    {
      ticker: 'TGT',
      logo: 'tgt',
      decimals: 18,
      priceProviderId: 'thorwallet',
      id: '0x108a850856Db3f85d0269a2693D896B394C80325',
    },
    {
      ticker: 'FOX',
      logo: 'fox',
      decimals: 18,
      priceProviderId: 'shapeshift-fox-token',
      id: '0xc770eefad204b5180df6a14ee197d99d808ee52d',
    },
    {
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      priceProviderId: 'dai',
      id: '0x6b175474e89094c44da98b954eedeac495271d0f',
    },
    {
      ticker: 'WETH',
      logo: 'weth',
      decimals: 18,
      priceProviderId: 'weth',
      id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    {
      ticker: 'YFI',
      logo: 'yfi',
      decimals: 18,
      priceProviderId: 'yearn-finance',
      id: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
    },
    {
      ticker: 'AAVE',
      logo: 'aave',
      decimals: 18,
      priceProviderId: 'aave',
      id: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    },
    {
      ticker: 'COMP',
      logo: 'comp',
      decimals: 18,
      priceProviderId: 'compound-governance-token',
      id: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    },
    {
      ticker: 'BAT',
      logo: 'bat',
      decimals: 18,
      priceProviderId: 'basic-attention-token',
      id: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
    },
    {
      ticker: 'SNX',
      logo: 'snx',
      decimals: 18,
      priceProviderId: 'havven',
      id: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
    },
    {
      ticker: 'BAL',
      logo: 'bal',
      decimals: 18,
      priceProviderId: 'balancer',
      id: '0xba100000625a3754423978a60c9317c58a424e3d',
    },
    {
      ticker: 'SUSHI',
      logo: 'sushi',
      decimals: 18,
      priceProviderId: 'sushi',
      id: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    },
    {
      ticker: 'MKR',
      logo: 'mkr',
      decimals: 18,
      priceProviderId: 'maker',
      id: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    },
    {
      ticker: 'KNC',
      logo: 'knc',
      decimals: 18,
      priceProviderId: 'kyber-network-crystal',
      id: '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202',
    },
    {
      ticker: 'GRT',
      logo: 'grt',
      decimals: 18,
      priceProviderId: 'the-graph',
      id: '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
    },
    {
      ticker: 'PEPE',
      logo: 'pepe',
      decimals: 18,
      priceProviderId: 'pepe',
      id: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    },
  ],
  [Chain.Avalanche]: [
    {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      id: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
    },
    {
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      id: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    },
    {
      ticker: 'BTC.b',
      logo: 'btc',
      decimals: 8,
      id: '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
    },
    {
      ticker: 'sAVAX',
      logo: 'savax',
      decimals: 18,
      id: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
    },
    {
      ticker: 'JOE',
      logo: 'joe',
      decimals: 18,
      id: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
    },
    {
      ticker: 'PNG',
      logo: 'png',
      decimals: 18,
      id: '0x60781C2586D68229fde47564546784ab3fACA982',
    },
    {
      ticker: 'WAVAX',
      logo: 'avax',
      decimals: 18,
      id: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    },
    {
      ticker: 'aAvaUSDC',
      logo: 'aave',
      decimals: 6,
      id: '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    },
    {
      ticker: 'BLS',
      logo: 'bls',
      decimals: 18,
      id: '0x46B9144771Cb3195D66e4EDA643a7493fADCAF9D',
    },
    {
      ticker: 'COQ',
      logo: 'coq',
      decimals: 18,
      id: '0x420FcA0121DC28039145009570975747295f2329',
    },
  ],
  [Chain.BSC]: [
    {
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 18,
      id: '0x55d398326f99059fF775485246999027B3197955',
    },
    {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 18,
      id: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
    {
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      id: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
    },
    {
      ticker: 'WETH',
      logo: 'weth',
      decimals: 18,
      id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    {
      ticker: 'AAVE',
      logo: 'aave',
      decimals: 18,
      id: '0xfb6115445bff7b52feb98650c87f44907e58f802',
    },
    {
      ticker: 'COMP',
      logo: 'comp',
      decimals: 18,
      id: '0x52ce071bd9b1c4b00a0b92d298c512478cad67e8',
    },
    {
      ticker: 'SUSHI',
      logo: 'sushi',
      decimals: 18,
      id: '0x947950bcc74888a40ffa2593c5798f11fc9124c4',
    },
    {
      ticker: 'KNC',
      logo: 'knc',
      decimals: 18,
      id: '0xfe56d5892bdffc7bf58f2e84be1b2c32d21c308b',
    },
    {
      ticker: 'PEPE',
      logo: 'pepe',
      decimals: 18,
      id: '0x25d887ce7a35172c62febfd67a1856f20faebb00',
    },
  ],
  [Chain.Base]: [
    {
      ticker: 'WEWE',
      logo: 'wewe',
      decimals: 18,
      id: '0x6b9bb36519538e0C073894E964E90172E1c0B41F',
    },
    {
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      priceProviderId: 'dai',
      id: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    },
    {
      ticker: 'rETH',
      logo: 'reth',
      decimals: 18,
      priceProviderId: 'reth',
      id: '0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c',
    },
    {
      ticker: 'ezETH',
      logo: 'ezeth',
      decimals: 18,
      priceProviderId: 'ezeth',
      id: '0x2416092f143378750bb29b79eD961ab195CcEea5',
    },
    {
      ticker: 'PYTH',
      logo: 'pyth',
      decimals: 18,
      priceProviderId: 'pyth',
      id: '0x4c5d8A75F3762c1561D96f177694f67378705E98',
    },
    {
      ticker: 'OM',
      logo: 'om',
      decimals: 18,
      priceProviderId: 'om',
      id: '0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98',
    },
    {
      ticker: 'W',
      logo: 'w',
      decimals: 18,
      priceProviderId: 'w',
      id: '0xB0fFa8000886e57F86dd5264b9582b2Ad87b2b91',
    },
    {
      ticker: 'cbETH',
      logo: 'cbeth',
      decimals: 18,
      priceProviderId: 'cbETH',
      id: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    },
    {
      ticker: 'SNX',
      logo: 'snx',
      decimals: 18,
      priceProviderId: 'SNX',
      id: '0x22e6966B799c4D5B13BE962E1D117b56327FDa66',
    },
    {
      ticker: 'AERO',
      logo: 'aero',
      decimals: 18,
      priceProviderId: 'AERO',
      id: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    },
  ],
  [Chain.Arbitrum]: [
    {
      ticker: 'ARB',
      logo: 'arbitrum',
      decimals: 18,
      priceProviderId: 'arbitrum',
      id: '0x912ce59144191c1204e64559fe8253a0e49e6548',
    },
    {
      ticker: 'TGT',
      logo: 'tgt',
      decimals: 18,
      priceProviderId: 'thorwallet',
      id: '0x429fEd88f10285E61b12BDF00848315fbDfCC341',
    },
    {
      ticker: 'FOX',
      logo: 'fox',
      decimals: 18,
      priceProviderId: 'shapeshift-fox-token',
      id: '0xf929de51D91C77E42f5090069E0AD7A09e513c73',
    },
    {
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      priceProviderId: 'USDT',
      id: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    },
    {
      ticker: 'USDC.e',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'USDC.e',
      id: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    },
    {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'USDC',
      id: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    },
    {
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      priceProviderId: 'WBTC',
      id: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    },
    {
      ticker: 'LINK',
      logo: 'link',
      decimals: 18,
      priceProviderId: 'LINK',
      id: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
    },
    {
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      priceProviderId: 'DAI',
      id: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    },
    {
      ticker: 'UNI',
      logo: 'uni',
      decimals: 18,
      priceProviderId: 'UNI',
      id: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
    },
    {
      ticker: 'PEPE',
      logo: 'pepe',
      decimals: 18,
      priceProviderId: 'PEPE',
      id: '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00',
    },
    {
      ticker: 'GRT',
      logo: 'grt',
      decimals: 18,
      priceProviderId: 'GRT',
      id: '0x9623063377AD1B27544C965cCd7342f7EA7e88C7',
    },
    {
      ticker: 'ezETH',
      logo: 'ezeth',
      decimals: 18,
      priceProviderId: 'ezETH',
      id: '0x2416092f143378750bb29b79eD961ab195CcEea5',
    },
    {
      ticker: 'PYTH',
      logo: 'pyth',
      decimals: 6,
      priceProviderId: 'PYTH',
      id: '0xE4D5c6aE46ADFAF04313081e8C0052A30b6Dd724',
    },
    {
      ticker: 'LDO',
      logo: 'ldo',
      decimals: 18,
      priceProviderId: 'LDO',
      id: '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60',
    },
  ],
  [Chain.Optimism]: [
    {
      ticker: 'OP',
      logo: 'optimism',
      decimals: 18,
      id: '0x4200000000000000000000000000000000000042',
    },
    {
      ticker: 'FOX',
      logo: 'fox',
      decimals: 18,
      id: '0xf1a0da3367bc7aa04f8d94ba57b862ff37ced174',
    },
    {
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      id: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    },
    {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      id: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    },
    {
      ticker: 'USDC.e',
      logo: 'usdc',
      decimals: 6,
      id: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    },
    {
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      id: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    },
    {
      ticker: 'LINK',
      logo: 'link',
      decimals: 18,
      id: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
    },
    {
      ticker: 'DAI',
      logo: 'dai',
      decimals: 18,
      id: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    },
    {
      ticker: 'ezETH',
      logo: 'ezeth',
      decimals: 18,
      id: '0x2416092f143378750bb29b79eD961ab195CcEea5',
    },
    {
      ticker: 'PYTH',
      logo: 'pyth',
      decimals: 6,
      id: '0x99C59ACeBFEF3BBFB7129DC90D1a11DB0E91187f',
    },
    {
      ticker: 'LDO',
      logo: 'ldo',
      decimals: 18,
      id: '0xFdb794692724153d1488CcdBE0C56c252596735F',
    },
  ],
  [Chain.Polygon]: [
    {
      ticker: 'WETH',
      logo: 'weth',
      decimals: 18,
      id: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    },
    {
      ticker: 'FOX',
      logo: 'fox',
      decimals: 18,
      id: '0x65a05db8322701724c197af82c9cae41195b0aa8',
    },
    {
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 6,
      id: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    },
    {
      ticker: 'BNB',
      logo: 'bsc',
      decimals: 18,
      id: '0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3',
    },
    {
      ticker: 'SOL',
      logo: 'solana',
      decimals: 9,
      id: '0xd93f7E271cB87c23AaA73edC008A79646d1F9912',
    },
    {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      id: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    },
    {
      ticker: 'USDC.e',
      logo: 'usdc',
      decimals: 6,
      id: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
    {
      ticker: 'BUSD',
      logo: 'busd',
      decimals: 18,
      id: '0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7',
    },
    {
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      id: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    },
    {
      ticker: 'AVAX',
      logo: 'avax',
      decimals: 18,
      id: '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b',
    },
    {
      ticker: 'SHIB',
      logo: 'shib',
      decimals: 18,
      id: '0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec',
    },
    {
      ticker: 'LINK',
      logo: 'link',
      decimals: 18,
      id: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
    },
  ],
  [Chain.Blast]: [
    {
      ticker: 'WETH',
      logo: 'weth',
      decimals: 18,
      priceProviderId: 'ethereum',
      id: '0x4300000000000000000000000000000000000004',
    },
    {
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      id: '0xF7bc58b8D8f97ADC129cfC4c9f45Ce3C0E1D2692',
    },
    {
      ticker: 'USDB',
      logo: 'usdb',
      decimals: 18,
      id: '0x4300000000000000000000000000000000000003',
    },
    {
      ticker: 'BLAST',
      logo: 'blast',
      decimals: 18,
      id: '0xb1a5700fA2358173Fe465e6eA4Ff52E36e88E2ad',
    },
    {
      ticker: 'MIM',
      logo: 'mim',
      decimals: 18,
      id: '0x76DA31D7C9CbEAE102aff34D3398bC450c8374c1',
    },
    {
      ticker: 'bLOOKS',
      logo: 'blooks',
      decimals: 18,
      id: '0x406F10d635be12ad33D6B133C6DA89180f5B999e',
    },
    {
      ticker: 'BAG',
      logo: 'bag',
      decimals: 18,
      id: '0xb9dfCd4CF589bB8090569cb52FaC1b88Dbe4981F',
    },
    {
      ticker: 'ZERO',
      logo: 'zero',
      decimals: 18,
      id: '0x357f93E17FdabEcd3fEFc488a2d27dff8065d00f',
    },
    {
      ticker: 'AI',
      logo: 'anyinu',
      decimals: 18,
      id: '0x764933fbAd8f5D04Ccd088602096655c2ED9879F',
    },
    {
      ticker: 'JUICE',
      logo: 'juice',
      decimals: 18,
      id: '0x818a92bc81Aad0053d72ba753fb5Bc3d0C5C0923',
    },
    {
      ticker: 'OMNI',
      logo: 'omni',
      decimals: 18,
      id: '0x9e20461bc2c4c980f62f1B279D71734207a6A356',
    },
    {
      ticker: 'DACKIE',
      logo: 'dackie',
      decimals: 18,
      id: '0x47C337Bd5b9344a6F3D6f58C474D9D8cd419D8cA',
    },
  ],
  [Chain.Cosmos]: [
    {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'usd-coin',
      id: 'ibc/F663521BF1836B00F5F177680F74BFB9A8B5654A694D0D2BC249E03CF2509013',
    },
    {
      ticker: 'WINK',
      logo: 'wink.png',
      decimals: 6,
      priceProviderId: 'winkhub',
      id: 'ibc/4363FD2EF60A7090E405B79A6C4337C5E9447062972028F5A99FB041B9571942',
    },
    {
      ticker: 'LVN',
      logo: 'levana',
      decimals: 6,
      priceProviderId: 'levana-protocol',
      id: 'ibc/6C95083ADD352D5D47FB4BA427015796E5FEF17A829463AD05ECD392EB38D889',
    },
    {
      ticker: 'NSTK',
      logo: 'nstk.png',
      decimals: 6,
      priceProviderId: 'unstake-fi',
      id: 'ibc/0B99C4EFF1BD05E56DEDEE1D88286DB79680C893724E0E7573BC369D79B5DDF3',
    },
    {
      ticker: 'USK',
      logo: 'usk.png',
      decimals: 6,
      priceProviderId: 'usk',
      id: 'ibc/A47E814B0E8AE12D044637BCB4576FCA675EF66300864873FA712E1B28492B78',
    },
    {
      ticker: 'NAMI',
      logo: 'nami.png',
      decimals: 6,
      priceProviderId: 'nami-protocol',
      id: 'ibc/4622E82B845FFC6AA8B45C1EB2F507133A9E876A5FEA1BA64585D5F564405453',
    },
    {
      ticker: 'FUZN',
      logo: 'fuzn.png',
      decimals: 6,
      priceProviderId: 'fuzion',
      id: 'ibc/6BBBB4B63C51648E9B8567F34505A9D5D8BAAC4C31D768971998BE8C18431C26',
    },
    {
      ticker: 'rKUJI',
      logo: 'rkuji.png',
      decimals: 6,
      priceProviderId: 'kujira',
      id: 'ibc/50A69DC508ACCADE2DAC4B8B09AA6D9C9062FCBFA72BB4C6334367DECD972B06',
    },
  ],
  [Chain.Osmosis]: [
    {
      ticker: 'ION',
      logo: 'ion',
      decimals: 6,
      priceProviderId: 'ion',
      id: 'uion',
    },
    {
      ticker: 'LVN',
      logo: 'levana',
      decimals: 6,
      priceProviderId: 'levana-protocol',
      id: 'factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn',
    },
  ],
  [Chain.Kujira]: [
    {
      ticker: 'USK',
      logo: 'usk.png',
      decimals: 6,
      priceProviderId: 'usk',
      id: 'factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk',
    },
    {
      ticker: 'WINK',
      logo: 'wink.png',
      decimals: 6,
      priceProviderId: 'winkhub',
      id: 'factory/kujira12cjjeytrqcj25uv349thltcygnp9k0kukpct0e/uwink',
    },
    {
      ticker: 'NSTK',
      logo: 'nstk.png',
      decimals: 6,
      priceProviderId: 'unstake-fi',
      id: 'factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk',
    },
    {
      ticker: 'MNTA',
      logo: 'mnta.png',
      decimals: 6,
      priceProviderId: 'mantadao',
      id: 'factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta',
    },
    {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'usd-coin',
      id: 'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9',
    },
    {
      ticker: 'ASTRO',
      logo: 'terra-astroport.png',
      decimals: 6,
      priceProviderId: 'astroport-fi',
      id: 'ibc/640E1C3E28FD45F611971DF891AE3DC90C825DF759DF8FAA8F33F7F72B35AD56',
    },
    {
      ticker: 'LUNC',
      logo: 'lunc',
      decimals: 6,
      priceProviderId: 'terra-luna',
      id: 'ibc/119334C55720942481F458C9C462F5C0CD1F1E7EEAC4679D674AA67221916AEA',
    },
    {
      ticker: 'rKUJI',
      logo: 'rKUJI.png',
      decimals: 6,
      priceProviderId: 'kujira',
      id: 'factory/kujira1tsekaqv9vmem0zwskmf90gpf0twl6k57e8vdnq/urkuji',
    },
    {
      ticker: 'NAMI',
      logo: 'NAMI.png',
      decimals: 6,
      priceProviderId: 'nami-protocol',
      id: 'factory/kujira13x2l25mpkhwnwcwdzzd34cr8fyht9jlj7xu9g4uffe36g3fmln8qkvm3qn/unami',
    },
    {
      ticker: 'FUZN',
      logo: 'fuzn.png',
      decimals: 6,
      priceProviderId: 'fuzion',
      id: 'factory/kujira1sc6a0347cc5q3k890jj0pf3ylx2s38rh4sza4t/ufuzn',
    },
  ],
  [Chain.Terra]: [
    {
      ticker: 'TPT',
      logo: 'terra-poker-token.png',
      decimals: 6,
      priceProviderId: 'tpt',
      id: 'terra13j2k5rfkg0qhk58vz63cze0uze4hwswlrfnm0fa4rnyggjyfrcnqcrs5z2',
    },
    {
      ticker: 'ASTRO-IBC',
      logo: 'terra-astroport.png',
      decimals: 6,
      priceProviderId: 'astroport-fi',
      id: 'ibc/8D8A7F7253615E5F76CB6252A1E1BD921D5EDB7BBAAF8913FB1C77FF125D9995',
    },
    {
      ticker: 'ASTRO',
      logo: 'terra-astroport.png',
      decimals: 6,
      priceProviderId: 'astroport-fi',
      id: 'terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26',
    },
  ],
  [Chain.TerraClassic]: [
    {
      ticker: 'ASTROC',
      logo: 'terra-astroport.png',
      decimals: 6,
      priceProviderId: 'astroport',
      id: 'terra1xj49zyqrwpv5k928jwfpfy2ha668nwdgkwlrg3',
    },
  ],
}

export const chainNativeTokens: Partial<Record<Chain, Coin[]>> = recordMap(
  leanChainNativeTokens as Record<Chain, Omit<Coin, 'chain'>[]>,
  (tokens, chain) => tokens.map(token => ({ ...token, chain }))
)

const mergedLeanChainTokens = Object.values(Chain).reduce(
  (acc, chain) => {
    const tokens = [
      ...(leanChainTokens[chain] ?? []),
      ...(leanChainNativeTokens[chain] ?? []),
    ]

    if (!isEmpty(tokens)) {
      acc[chain] = tokens
    }

    return acc
  },
  {} as Partial<Record<Chain, Omit<Coin, 'chain'>[]>>
)

type TokenWithoutChain = Omit<Coin, 'chain'>

export const chainTokens: Partial<Record<Chain, Coin[]>> = (() => {
  const base = initializeChainTokens(
    mergedLeanChainTokens as Record<Chain, TokenWithoutChain[]>
  )

  for (const chain of CHAINS_WITH_IBC_TOKENS) {
    const ibcMeta = IBC_TRANSFERRABLE_TOKENS_PER_CHAIN[chain] ?? []
    const current = base[chain] ?? []

    const patched = patchTokensWithIBCIds(current, ibcMeta)
    const additions = getMissingIBCTokens(patched, ibcMeta, chain)

    if (patched.length || additions.length) {
      base[chain] = [...patched, ...additions]
    }
  }

  base[Chain.THORChain] = [
    ...(base[Chain.THORChain] ?? []),
    ...IBC_TOKENS.map(t => ({
      ...t,
      chain: Chain.THORChain,
      id: `thor.${t.ticker.toLowerCase()}`,
    })),
  ]

  return base
})()
