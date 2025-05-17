import { Chain } from '@core/chain/Chain'

export enum CosmosMsgType {
  MSG_SEND = 'cosmos-sdk/MsgSend',
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
  CONNECT = 'connect',
  TRANSACTION = 'transaction',
  VAULTS = 'vaults',
}

export enum EventMethod {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
  CONNECT = 'connect',
  DISCONNECT = 'diconnect',
  NETWORK_CHANGED = 'networkChanged',
}

export namespace RequestMethod {
  export enum CTRL {
    DEPOSIT = 'deposit',
    GET_UNSPENT_UTXOS = 'get_unspent_utxos',
    REQUEST_ACCOUNTS_AND_KEYS = 'request_accounts_and_keys',
    SIGN_MESSAGE = 'sign_message',
    SIGN_PSBT = 'sign_psbt',
    SIGN_TRANSACTION = 'sign_transaction',
    TRANSFER = 'transfer',
  }

  export enum METAMASK {
    ETH_ACCOUNTS = 'eth_accounts',
    ETH_BLOB_BASE_FEE = 'eth_blobBaseFee',
    ETH_BLOCK_NUMBER = 'eth_blockNumber',
    ETH_CALL = 'eth_call',
    ETH_CHAIN_ID = 'eth_chainId',
    ETH_COINBASE = 'eth_coinbase',
    ETH_DECRYPT = 'eth_decrypt',
    ETH_ESTIMATE_GAS = 'eth_estimateGas',
    ETH_FEE_HISTORY = 'eth_feeHistory',
    ETH_GAS_PRICE = 'eth_gasPrice',
    ETH_GET_BALANCE = 'eth_getBalance',
    ETH_GET_BLOCK_BY_HASH = 'eth_getBlockByHash',
    ETH_GET_BLOCK_BY_NUMBER = 'eth_getBlockByNumber',
    ETH_GET_BLOCK_RECEIPTS = 'eth_getBlockReceipts',
    ETH_GET_BLOCK_TRANSACTION_COUNT_BY_HASH = 'eth_getBlockTransactionCountByHash',
    ETH_GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER = 'eth_getBlockTransactionCountByNumber',
    ETH_GET_CODE = 'eth_getCode',
    ETH_GET_ENCRYPTION_PUBLIC_KEY = 'eth_getEncryptionPublicKey',
    ETH_GET_FILTER_CHANGES = 'eth_getFilterChanges',
    ETH_GET_FILTER_LOGS = 'eth_getFilterLogs',
    ETH_GET_LOGS = 'eth_getLogs',
    ETH_GET_PROOF = 'eth_getProof',
    ETH_GET_STORAGEAT = 'eth_getStorageAt',
    ETH_GET_TRANSACTION_BY_BLOCK_HASH_AND_INDEX = 'eth_getTransactionByBlockHashAndIndex',
    ETH_GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX = 'eth_getTransactionByBlockNumberAndIndex',
    ETH_GET_TRANSACTION_BY_HASH = 'eth_getTransactionByHash',
    ETH_GET_TRANSACTION_COUNT = 'eth_getTransactionCount',
    ETH_GET_TRANSACTION_RECEIPT = 'eth_getTransactionReceipt',
    ETH_GET_UNCLE_COUNT_BY_BLOCK_HASH = 'eth_getUncleCountByBlockHash',
    ETH_GET_UNCLE_COUNT_BY_BLOCK_NUMBER = 'eth_getUncleCountByBlockNumber',
    ETH_MAX_PRIORITY_FEE_PER_GAS = 'eth_maxPriorityFeePerGas',
    ETH_NEW_BLOCK_FILTER = 'eth_newBlockFilter',
    ETH_NEW_FILTER = 'eth_newFilter',
    ETH_NEW_PENDING_TRANSACTION_FILTER = 'eth_newPendingTransactionFilter',
    ETH_REQUEST_ACCOUNTS = 'eth_requestAccounts',
    ETH_SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SIGN = 'eth_sign',
    ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
    ETH_SUBSCRIBE = 'eth_subscribe',
    ETH_SYNCING = 'eth_syncing',
    ETH_UNINSTALL_FILTER = 'eth_uninstallFilter',
    ETH_UNSUBSCRIBE = 'eth_unsubscribe',
    NET_VERSION = 'net_version',
    PERSONAL_SIGN = 'personal_sign',
    WALLET_ADD_ETHEREUM_CHAIN = 'wallet_addEthereumChain',
    WALLET_GET_PERMISSIONS = 'wallet_getPermissions',
    WALLET_REGISTER_ONBOARDING = 'wallet_registerOnboarding',
    WALLET_REQUEST_PERMISSIONS = 'wallet_requestPermissions',
    WALLET_REVOKE_PERMISSIONS = 'wallet_revokePermissions',
    WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
    WALLET_SCAN_QR_CODE = 'wallet_scanQRCode',
    WALLET_WATCH_ASSET = 'wallet_watchAsset',
    WEB3_CLIENT_VERSION = 'web3_clientVersion',
  }

  export enum VULTISIG {
    GET_ACCOUNTS = 'get_accounts',
    CHAIN_ID = 'chain_id',
    DEPOSIT_TRANSACTION = 'deposit_transaction',
    GET_TRANSACTION_BY_HASH = 'get_transaction_by_hash',
    REQUEST_ACCOUNTS = 'request_accounts',
    SEND_TRANSACTION = 'send_transaction',
    WALLET_ADD_CHAIN = 'wallet_add_chain',
    WALLET_SWITCH_CHAIN = 'wallet_switch_chain',
  }
}

const supportedChains: Record<Chain, boolean> = {
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
  [Chain.Tron]: false,
}

export function isSupportedChain(chain?: Chain): boolean {
  return chain ? supportedChains[chain] : false
}
