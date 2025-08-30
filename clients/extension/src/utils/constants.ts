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
