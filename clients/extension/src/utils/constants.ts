export enum CosmosMsgType {
  MSG_SEND = 'cosmos-sdk/MsgSend',
  THORCHAIN_MSG_SEND = 'thorchain/MsgSend',
  MSG_EXECUTE_CONTRACT = 'wasm/MsgExecuteContract',
  MSG_EXECUTE_CONTRACT_URL = '/cosmwasm.wasm.v1.MsgExecuteContract',
  MSG_TRANSFER_URL = '/ibc.applications.transfer.v1.MsgTransfer',
  MSG_SEND_URL = '/cosmos.bank.v1beta1.MsgSend',
  THORCHAIN_MSG_DEPOSIT = 'thorchain/MsgDeposit',
  THORCHAIN_MSG_DEPOSIT_URL = '/types.MsgDeposit',
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
  POLKADOT_REQUEST = 'polkadot',
  RIPPLE_REQUEST = 'ripple',
  SOLANA_REQUEST = 'solana',
  THOR_REQUEST = 'thor',
  ZCASH_REQUEST = 'zcash',
  PRIORITY = 'priority',
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
    ETH_BLOB_BASE_FEE = 'eth_blobBaseFee',
    ETH_COINBASE = 'eth_coinbase',
    ETH_DECRYPT = 'eth_decrypt',
    ETH_FEE_HISTORY = 'eth_feeHistory',
    ETH_GET_BLOCK_BY_HASH = 'eth_getBlockByHash',
    ETH_GET_BLOCK_RECEIPTS = 'eth_getBlockReceipts',
    ETH_GET_BLOCK_TRANSACTION_COUNT_BY_HASH = 'eth_getBlockTransactionCountByHash',
    ETH_GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER = 'eth_getBlockTransactionCountByNumber',
    ETH_GET_ENCRYPTION_PUBLIC_KEY = 'eth_getEncryptionPublicKey',
    ETH_GET_FILTER_CHANGES = 'eth_getFilterChanges',
    ETH_GET_FILTER_LOGS = 'eth_getFilterLogs',
    ETH_GET_LOGS = 'eth_getLogs',
    ETH_GET_PROOF = 'eth_getProof',
    ETH_GET_STORAGEAT = 'eth_getStorageAt',
    ETH_GET_TRANSACTION_BY_BLOCK_HASH_AND_INDEX = 'eth_getTransactionByBlockHashAndIndex',
    ETH_GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX = 'eth_getTransactionByBlockNumberAndIndex',
    ETH_GET_UNCLE_COUNT_BY_BLOCK_HASH = 'eth_getUncleCountByBlockHash',
    ETH_GET_UNCLE_COUNT_BY_BLOCK_NUMBER = 'eth_getUncleCountByBlockNumber',
    ETH_NEW_BLOCK_FILTER = 'eth_newBlockFilter',
    ETH_NEW_FILTER = 'eth_newFilter',
    ETH_NEW_PENDING_TRANSACTION_FILTER = 'eth_newPendingTransactionFilter',
    ETH_SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SIGN = 'eth_sign',
    ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
    ETH_SUBSCRIBE = 'eth_subscribe',
    ETH_SYNCING = 'eth_syncing',
    ETH_UNINSTALL_FILTER = 'eth_uninstallFilter',
    ETH_UNSUBSCRIBE = 'eth_unsubscribe',
    PERSONAL_SIGN = 'personal_sign',
    WALLET_REGISTER_ONBOARDING = 'wallet_registerOnboarding',
    WALLET_SCAN_QR_CODE = 'wallet_scanQRCode',
    WALLET_WATCH_ASSET = 'wallet_watchAsset',
    WEB3_CLIENT_VERSION = 'web3_clientVersion',
  }

  export enum VULTISIG {
    DEPOSIT_TRANSACTION = 'deposit_transaction',
    GET_TRANSACTION_BY_HASH = 'get_transaction_by_hash',
    SEND_TRANSACTION = 'send_transaction',
    PLUGIN_REQUEST_RESHARE = 'plugin_request_reshare',
  }
}
