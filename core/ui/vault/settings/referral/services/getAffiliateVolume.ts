import { queryUrl } from '@lib/utils/query/queryUrl'

import { midgardBaseUrl } from '../config'

type AffiliateVolume = { meta: { volume: string } }

export const getAffiliateVolume = async (thorname: string) =>
  queryUrl<AffiliateVolume>(
    `${midgardBaseUrl}/history/affiliate?thorname=${thorname}`
  )
