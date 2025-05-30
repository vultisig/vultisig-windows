import { Coin } from '@core/chain/coin/Coin'

export interface SendFormShape {
  amount: number | null
  address: string
  coin: Coin | null
}

export type ValidationResult<T> = Partial<{ [P in keyof T]: string }>
