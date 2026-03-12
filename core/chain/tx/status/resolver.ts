import { Resolver } from '@lib/utils/types/Resolver'

import { Chain } from '../../Chain'

type TxStatus = 'pending' | 'success' | 'error'

export type TxReceiptInfo = {
  feeAmount: bigint
  feeDecimals: number
  feeTicker: string
}

export type TxStatusResult = {
  status: TxStatus
  receipt?: TxReceiptInfo
}

export type TxStatusResolver<T extends Chain = Chain> = Resolver<
  {
    chain: T
    hash: string
  },
  Promise<TxStatusResult>
>
