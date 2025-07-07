import { queryUrl } from '@lib/utils/query/queryUrl'

import { cardanoApiUrl } from './config'

type CardanoTipResponse = Array<{
  abs_slot: number
}>

export const getCardanoCurrentSlot = async (): Promise<bigint> => {
  const url = `${cardanoApiUrl}/tip`

  const [{ abs_slot }] = await queryUrl<CardanoTipResponse>(url)

  return BigInt(abs_slot)
}
