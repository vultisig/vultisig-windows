import { Coin } from '@core/chain/coin/Coin'

export type SendFormShape = {
  amount: bigint | null
  senderAddress: string
  receiverAddress: string
  coin: Coin | null
}

export type ValidationResult<T> = Partial<{ [P in keyof T]: string }>
