import { sunToTrx, TronResourceType } from '@core/chain/chains/tron/resources'

import { useTronAccountResourcesQuery } from '../../chain/tron/useTronAccountResourcesQuery'

type Params = {
  resourceType: TronResourceType
}

export const useTronFrozenBalance = ({ resourceType }: Params) => {
  const { data } = useTronAccountResourcesQuery()

  if (!data) return 0

  const frozenSun =
    resourceType === 'BANDWIDTH'
      ? data.frozenForBandwidthSun
      : data.frozenForEnergySun

  return sunToTrx(frozenSun)
}
