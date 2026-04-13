/** A Bitcoin UTXO that can potentially be claimed on the QBTC chain. */
export type ClaimableUtxo = {
  txid: string
  vout: number
  /** BTC amount in satoshis. */
  amount: number
}

/** A single QBTC module parameter. */
type QbtcParam = {
  key: string
  value: string
}

/** Response shape from the QBTC params endpoint. */
export type QbtcParamsResponse = {
  param: QbtcParam
}
