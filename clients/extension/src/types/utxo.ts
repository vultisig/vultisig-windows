export interface BlockchairUtxoResponse {
  [address: string]: {
    utxo: Array<{
      transactionHash: string
      value: string
      index: number
    }>
  }
}
