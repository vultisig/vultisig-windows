export enum CosmosMsgType {
  MSG_SEND = 'cosmos-sdk/MsgSend',
  THORCHAIN_MSG_SEND = 'thorchain/MsgSend',
  MSG_EXECUTE_CONTRACT = 'wasm/MsgExecuteContract',
  MSG_EXECUTE_CONTRACT_URL = '/cosmwasm.wasm.v1.MsgExecuteContract',
  MSG_TRANSFER_URL = '/ibc.applications.transfer.v1.MsgTransfer',
  MSG_SEND_URL = '/cosmos.bank.v1beta1.MsgSend',
  THORCHAIN_MSG_DEPOSIT = 'thorchain/MsgDeposit',
  THORCHAIN_MSG_DEPOSIT_URL = '/types.MsgDeposit',
  THORCHAIN_MSG_SEND_URL = '/types.MsgSend',
}
