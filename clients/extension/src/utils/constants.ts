import type {
  ChainStrRef,
  CurrencyRef,
  LanguageRef,
} from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'
import keyMirror from 'keymirror'
export enum CosmosMsgType {
  MSG_SEND = 'cosmos-sdk/MsgSend',
}

export enum ChainTicker {
  BTC = 'BTC',
  DOGE = 'DOGE',
  LTC = 'LTC',
  BCH = 'BCH',
  ETH = 'ETH',
  AVAX = 'AVAX',
  BNB = 'BNB',
  GAIA = 'GAIA',
  THOR = 'RUNE',
  BSC = 'BSC',
  BASE = 'BASE',
  SOL = 'SOL',
  CRO = 'CRO',
  DYDX = 'DYDX',
  DASH = 'DASH',
  ATOM = 'ATOM',
  KUJI = 'KUJI',
  CACAO = 'CACAO',
  OSMO = 'OSMO',
  MATIC = 'MATIC',
}

export enum MessageKey {
  BITCOIN_REQUEST = 'bitcoin',
  BITCOIN_CASH_REQUEST = 'bitcoincash',
  COSMOS_REQUEST = 'cosmos',
  DASH_REQUEST = 'dash',
  DOGECOIN_REQUEST = 'dogecoin',
  ETHEREUM_REQUEST = 'ethereum',
  LITECOIN_REQUEST = 'litecoin',
  MAYA_REQUEST = 'maya',
  SOLANA_REQUEST = 'solana',
  THOR_REQUEST = 'thor',
  PRIORITY = 'priority',
  VAULT = 'vault',
  VAULTS = 'vaults',
}

export enum SenderKey {
  PAGE = 'page',
  RELAY = 'relay',
}

export enum Currency {
  AUD = 'AUD',
  CAD = 'CAD',
  CNY = 'CNY',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  RUB = 'RUB',
  SEK = 'SEK',
  SGD = 'SGD',
  USD = 'USD',
}

export enum Instance {
  ACCOUNTS = 'accounts',
  TRANSACTION = 'transaction',
  VAULT = 'vault',
  VAULTS = 'vaults',
}

export enum Language {
  CROATIA = 'hr',
  DUTCH = 'nl',
  ENGLISH = 'en',
  GERMAN = 'de',
  ITALIAN = 'it',
  RUSSIAN = 'ru',
  PORTUGUESE = 'pt',
  SPANISH = 'es',
}

export enum EventMethod {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
  CONNECT = 'connect',
  DISCONNECT = 'diconnect',
  ERROR = 'ERROR',
  MESSAGE = 'MESSAGE',
  NETWORK_CHANGED = 'networkChanged',
}

export enum TssKeysignType {
  ECDSA = 'ECDSA',
  EdDSA = 'EdDSA',
}

export const requestMethod = {
  ctrl: {
    deposit: {
      key: 'deposit',
      auth: false,
    },
    getUnspentUtxos: {
      key: 'get_unspent_utxos',
      auth: false,
    },
    requestAccountsAndKeys: {
      key: 'request_accounts_and_keys',
      auth: false,
    },
    signMessage: {
      key: 'sign_message',
      auth: false,
    },
    signPsbt: {
      key: 'sign_psbt',
      auth: false,
    },
    signTransaction: {
      key: 'sign_transaction',
      auth: false,
    },
    transfer: {
      key: 'transfer',
      auth: false,
    },
  },
  metamask: {
    addChain: {
      key: 'wallet_addEthereumChain',
      auth: false,
    },
    blobBaseFee: {
      key: 'eth_blobBaseFee',
      auth: false,
    },
    blockNumber: {
      key: 'eth_blockNumber',
      auth: false,
    },
    call: {
      key: 'eth_call',
      auth: false,
    },
    chainId: {
      key: 'eth_chainId',
      auth: false,
    },
    coinbase: {
      key: 'eth_coinbase',
      auth: false,
    },
    decrypt: {
      key: 'eth_decrypt',
      auth: false,
    },
    estimateGas: {
      key: 'eth_estimateGas',
      auth: false,
    },
    feeHistory: {
      key: 'eth_feeHistory',
      auth: false,
    },
    getAccounts: {
      key: 'eth_accounts',
      auth: false,
    },
    getBalance: {
      key: 'eth_getBalance',
      auth: false,
    },
    getBlockByHash: {
      key: 'eth_getBlockByHash',
      auth: false,
    },
    getBlockByNumber: {
      key: 'eth_getBlockByNumber',
      auth: false,
    },
    getBlockReceipts: {
      key: 'eth_getBlockReceipts',
      auth: false,
    },
    getBlockTransactionCountByHash: {
      key: 'eth_getBlockTransactionCountByHash',
      auth: false,
    },
    getBlockTransactionCountByNumber: {
      key: 'eth_getBlockTransactionCountByNumber',
      auth: false,
    },
    getEncryptionPublicKey: {
      key: 'eth_getEncryptionPublicKey',
      auth: false,
    },
    getCode: {
      key: 'eth_getCode',
      auth: false,
    },
    getFilterChanges: {
      key: 'eth_getFilterChanges',
      auth: false,
    },
    getFilterLogs: {
      key: 'eth_getFilterLogs',
      auth: false,
    },
    getLogs: {
      key: 'eth_getLogs',
      auth: false,
    },
    getPermissions: {
      key: 'wallet_getPermissions',
      auth: false,
    },
    gasPrice: {
      key: 'eth_gasPrice',
      auth: false,
    },
    getProof: {
      key: 'eth_getProof',
      auth: false,
    },
    getStorageat: {
      key: 'eth_getStorageAt',
      auth: false,
    },
    getTransactionByBlockHashAndIndex: {
      key: 'eth_getTransactionByBlockHashAndIndex',
      auth: false,
    },
    getTransactionByBlockNumberAndIndex: {
      key: 'eth_getTransactionByBlockNumberAndIndex',
      auth: false,
    },
    getTransactionByHash: {
      key: 'eth_getTransactionByHash',
      auth: false,
    },
    getTransactionCount: {
      key: 'eth_getTransactionCount',
      auth: false,
    },
    getTransactionReceipt: {
      key: 'eth_getTransactionReceipt',
      auth: false,
    },
    getUncleCountByBlockHash: {
      key: 'eth_getUncleCountByBlockHash',
      auth: false,
    },
    getUncleCountByBlockNumber: {
      key: 'eth_getUncleCountByBlockNumber',
      auth: false,
    },
    maxPriorityFeePerGas: {
      key: 'eth_maxPriorityFeePerGas',
      auth: false,
    },
    netVersion: {
      key: 'net_version',
      auth: false,
    },
    newBlockFilter: {
      key: 'eth_newBlockFilter',
      auth: false,
    },
    newFilter: {
      key: 'eth_newFilter',
      auth: false,
    },
    newPendingTransactionFilter: {
      key: 'eth_newPendingTransactionFilter',
      auth: false,
    },
    requestAccounts: {
      key: 'eth_requestAccounts',
      auth: false,
    },
    personalSign: {
      key: 'personal_sign',
      auth: false,
    },
    registerOnboarding: {
      key: 'wallet_registerOnboarding',
      auth: false,
    },
    requestPermissions: {
      key: 'wallet_requestPermissions',
      auth: false,
    },
    revokePermissions: {
      key: 'wallet_revokePermissions',
      auth: false,
    },
    scanQRCode: {
      key: 'wallet_scanQRCode',
      auth: false,
    },
    sendRawTransaction: {
      key: 'eth_sendRawTransaction',
      auth: false,
    },
    sendTransaction: {
      key: 'eth_sendTransaction',
      auth: false,
    },
    sign: {
      key: 'eth_sign',
      auth: false,
    },
    signTypedDataV4: {
      key: 'eth_signTypedData_v4',
      auth: false,
    },
    subscribe: {
      key: 'eth_subscribe',
      auth: false,
    },
    switchChain: {
      key: 'wallet_switchEthereumChain',
      auth: false,
    },
    syncing: {
      key: 'eth_syncing',
      auth: false,
    },
    uninstallFilter: {
      key: 'eth_uninstallFilter',
      auth: false,
    },
    unsubscribe: {
      key: 'eth_unsubscribe',
      auth: false,
    },
    watchAsset: {
      key: 'wallet_watchAsset',
      auth: false,
    },
    web3ClientVersion: {
      key: 'web3_clientVersion',
      auth: false,
    },
  },
  vultisig: {
    addChain: {
      key: 'wallet_add_chain',
      auth: false,
    },
    chainId: {
      key: 'chain_id',
      auth: false,
    },
    depositTransaction: {
      key: 'deposit_transaction',
      auth: false,
    },
    getAccounts: {
      key: 'get_accounts',
      auth: false,
    },
    getTransactionByHash: {
      key: 'get_transaction_by_hash',
      auth: false,
    },
    requestAccounts: {
      key: 'request_accounts',
      auth: false,
    },
    sendTransaction: {
      key: 'send_transaction',
      auth: false,
    },
    switchChain: {
      key: 'wallet_switch_chain',
      auth: false,
    },
  },
}

export const storageKey = keyMirror({
  CURRENCY: true,
  LANGUAGE: true,
  VAULTS: true,
})

export const errorKey = keyMirror({
  FAIL_TO_GET_ACCOUNTS: true,
  FAIL_TO_GET_ADDRESS: true,
  FAIL_TO_GET_VAULT: true,
  FAIL_TO_GET_VAULTS: true,
  FAIL_TO_GET_TRANSACTION: true,
  FAIL_TO_INIT_WASM: true,
  INVALID_CHAIN: true,
  INVALID_EXTENSION: true,
  INVALID_FILE: true,
  INVALID_QRCODE: true,
  INVALID_VAULT: true,
})

export const currencyName: CurrencyRef = {
  [Currency.AUD]: 'Australian Dollar',
  [Currency.CAD]: 'Canadian Dollar',
  [Currency.CNY]: 'Chinese Yuan',
  [Currency.EUR]: 'European Euro',
  [Currency.GBP]: 'British Pound',
  [Currency.JPY]: 'Japanese Yen',
  [Currency.RUB]: 'Russian Ruble',
  [Currency.SEK]: 'Swedish Krona',
  [Currency.SGD]: 'Singapore Dollar',
  [Currency.USD]: 'United States Dollar',
}

export const currencySymbol: CurrencyRef = {
  [Currency.AUD]: 'A$',
  [Currency.CAD]: 'C$',
  [Currency.CNY]: '¥',
  [Currency.EUR]: '€',
  [Currency.GBP]: '£',
  [Currency.JPY]: '¥',
  [Currency.RUB]: '₽',
  [Currency.SEK]: 'kr',
  [Currency.SGD]: 'S$',
  [Currency.USD]: '$',
}

export const languageName: LanguageRef = {
  [Language.CROATIA]: 'Hrvatski',
  [Language.DUTCH]: 'Dutch',
  [Language.ENGLISH]: 'English',
  [Language.GERMAN]: 'Deutsch',
  [Language.ITALIAN]: 'Italiano',
  [Language.PORTUGUESE]: 'Português',
  [Language.RUSSIAN]: 'Русский',
  [Language.SPANISH]: 'Espanol',
}

export const explorerUrl: ChainStrRef = {
  [Chain.Arbitrum]: 'https://arbiscan.io',
  [Chain.Avalanche]: 'https://snowtrace.io',
  [Chain.Base]: 'https://basescan.org',
  [Chain.Bitcoin]: 'https://blockchair.com/bitcoin',
  [Chain.BitcoinCash]: 'https://blockchair.com/bitcoin-cash',
  [Chain.Blast]: 'https://blastscan.io',
  [Chain.BSC]: 'https://bscscan.com',
  [Chain.CronosChain]: 'https://cronoscan.com',
  [Chain.Dash]: 'https://blockchair.com/dash',
  [Chain.Dogecoin]: 'https://blockchair.com/dogecoin',
  [Chain.Dydx]: 'https://www.mintscan.io/dydx',
  [Chain.Ethereum]: 'https://etherscan.io',
  [Chain.Cosmos]: 'https://www.mintscan.io/cosmos',
  [Chain.Kujira]: 'https://finder.kujira.network',
  [Chain.Litecoin]: 'https://blockchair.com/litecoin',
  [Chain.MayaChain]: 'https://www.mayascan.org',
  [Chain.Optimism]: 'https://optimistic.etherscan.io',
  [Chain.Osmosis]: 'https://www.mintscan.io/osmosis',
  [Chain.Polkadot]: 'https://polkadot.subscan.io/account',
  [Chain.Polygon]: 'https://polygonscan.com',
  [Chain.Solana]: 'https://solscan.io',
  [Chain.Sui]: '',
  [Chain.Terra]: '',
  [Chain.TerraClassic]: '',
  [Chain.THORChain]: 'https://thorchain.net',
  [Chain.Ton]: 'https://tonscan.org/',
  [Chain.Ripple]: '',
  [Chain.Zksync]: 'https://explorer.zksync.io',
  [Chain.Noble]: '',
  [Chain.Akash]: '',
}

export const rpcUrl: ChainStrRef = {
  [Chain.Arbitrum]: 'https://api.vultisig.com/arb/',
  [Chain.Avalanche]: 'https://api.vultisig.com/avax/',
  [Chain.Base]: 'https://api.vultisig.com/base/',
  [Chain.Bitcoin]: '',
  [Chain.BitcoinCash]: '',
  [Chain.Blast]: 'https://api.vultisig.com/blast/',
  [Chain.BSC]: 'https://api.vultisig.com/bnb/',
  [Chain.CronosChain]: 'https://cronos-evm-rpc.publicnode.com',
  [Chain.Dash]: '',
  [Chain.Dogecoin]: '',
  [Chain.Dydx]: 'https://dydx-rpc.publicnode.com',
  [Chain.Ethereum]: 'https://api.vultisig.com/eth/',
  [Chain.Cosmos]: 'https://cosmos-rpc.publicnode.com',
  [Chain.Kujira]: 'https://kujira-rpc.publicnode.com',
  [Chain.Litecoin]: '',
  [Chain.MayaChain]: '',
  [Chain.Optimism]: 'https://api.vultisig.com/opt/',
  [Chain.Osmosis]: 'https://osmosis-rpc.publicnode.com',
  [Chain.Polkadot]: '',
  [Chain.Polygon]: 'https://api.vultisig.com/polygon/',
  [Chain.Solana]: 'https://solana-rpc.publicnode.com',
  [Chain.Sui]: '',
  [Chain.Terra]: '',
  [Chain.TerraClassic]: '',
  [Chain.THORChain]: 'https://rpc.ninerealms.com/',
  [Chain.Ton]: '',
  [Chain.Ripple]: 'https://rpc.ninerealms.com/',
  [Chain.Zksync]: 'https://api.vultisig.com/zksync/',
  [Chain.Noble]: '',
  [Chain.Akash]: '',
}

export const supportedChains: Record<Chain, boolean> = {
  [Chain.Arbitrum]: true,
  [Chain.Avalanche]: true,
  [Chain.Base]: true,
  [Chain.Bitcoin]: true,
  [Chain.BitcoinCash]: true,
  [Chain.Blast]: true,
  [Chain.BSC]: true,
  [Chain.CronosChain]: true,
  [Chain.Dogecoin]: true,
  [Chain.Dash]: true,
  [Chain.Dydx]: true,
  [Chain.Ethereum]: true,
  [Chain.Cosmos]: true,
  [Chain.Kujira]: true,
  [Chain.Litecoin]: true,
  [Chain.MayaChain]: true,
  [Chain.Optimism]: true,
  [Chain.Osmosis]: true,
  [Chain.Polygon]: true,
  [Chain.Solana]: true,
  [Chain.THORChain]: true,
  [Chain.Zksync]: false,
  [Chain.Terra]: false,
  [Chain.TerraClassic]: false,
  [Chain.Noble]: false,
  [Chain.Akash]: false,
  [Chain.Sui]: false,
  [Chain.Polkadot]: false,
  [Chain.Ton]: false,
  [Chain.Ripple]: false,
}

export function isSupportedChain(chain?: Chain): boolean {
  return chain ? supportedChains[chain] : false
}
