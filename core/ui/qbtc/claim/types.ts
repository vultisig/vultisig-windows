/** Script public key associated with a QBTC UTXO. */
type QbtcScriptPubKey = {
  hex: string
  type: string
  address: string
}

/** A UTXO on the QBTC chain eligible for claiming. */
export type QbtcUtxo = {
  txid: string
  vout: number
  /** Total BTC amount in satoshis. */
  amount: string
  /** Amount entitled to claim in satoshis. Zero means already claimed. */
  entitled_amount: string
  script_pub_key: QbtcScriptPubKey
}

/** Response shape from the QBTC UTXO query endpoint. */
export type QbtcUtxosResponse = {
  utxos: QbtcUtxo[]
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
