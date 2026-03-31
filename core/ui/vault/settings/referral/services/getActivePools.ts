import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { midgardBaseUrl } from '../config'

type Pool = {
  asset: string
  status: string
}

export const getActivePools = async () =>
  queryUrl<Pool[]>(`${midgardBaseUrl}/pools?status=available`)
