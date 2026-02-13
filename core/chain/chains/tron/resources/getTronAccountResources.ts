import { tronRpcUrl } from '@core/chain/chains/tron/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { TronAccountResources, TronUnfreezingEntry } from './types'

type TronFrozenV2Entry = {
  type?: string | null
  amount?: number | null
}

type TronUnfrozenV2Entry = {
  unfreeze_amount?: number | null
  unfreeze_expire_time?: number | null
}

type TronGetAccountResponse = {
  frozenV2?: TronFrozenV2Entry[]
  unfrozenV2?: TronUnfrozenV2Entry[]
}

type TronGetAccountResourceResponse = {
  freeNetUsed?: number
  freeNetLimit?: number
  NetUsed?: number
  NetLimit?: number
  EnergyUsed?: number
  EnergyLimit?: number
}

export const getTronAccountResources = async (
  address: string
): Promise<TronAccountResources> => {
  const [account, resource] = await Promise.all([
    queryUrl<TronGetAccountResponse>(`${tronRpcUrl}/wallet/getaccount`, {
      body: { address, visible: true },
    }),
    queryUrl<TronGetAccountResourceResponse>(
      `${tronRpcUrl}/wallet/getaccountresource`,
      {
        body: { address, visible: true },
      }
    ),
  ])

  const frozenV2 = account.frozenV2 ?? []

  const frozenForBandwidthSun = BigInt(
    frozenV2
      .filter(entry => entry.type == null || entry.type === 'BANDWIDTH')
      .reduce((sum, entry) => sum + (entry.amount ?? 0), 0)
  )

  const frozenForEnergySun = BigInt(
    frozenV2
      .filter(entry => entry.type === 'ENERGY')
      .reduce((sum, entry) => sum + (entry.amount ?? 0), 0)
  )

  const unfreezingEntries: TronUnfreezingEntry[] = (account.unfrozenV2 ?? [])
    .flatMap(entry => {
      if (entry.unfreeze_amount == null || entry.unfreeze_expire_time == null) {
        return []
      }
      return [
        {
          unfreezeAmountSun: BigInt(entry.unfreeze_amount),
          expireTimeMs: entry.unfreeze_expire_time,
        },
      ]
    })
    .sort((a, b) => a.expireTimeMs - b.expireTimeMs)

  const freeNetUsed = resource.freeNetUsed ?? 0
  const freeNetLimit = resource.freeNetLimit ?? 0
  const netUsed = resource.NetUsed ?? 0
  const netLimit = resource.NetLimit ?? 0
  const energyUsed = resource.EnergyUsed ?? 0
  const energyLimit = resource.EnergyLimit ?? 0

  const totalBandwidth = freeNetLimit + netLimit
  const availableBandwidth = freeNetLimit - freeNetUsed + (netLimit - netUsed)

  const totalEnergy = energyLimit
  const availableEnergy = energyLimit - energyUsed

  return {
    bandwidth: {
      available: Math.max(availableBandwidth, 0),
      total: totalBandwidth,
      used: freeNetUsed + netUsed,
    },
    energy: {
      available: Math.max(availableEnergy, 0),
      total: totalEnergy,
      used: energyUsed,
    },
    frozenForBandwidthSun,
    frozenForEnergySun,
    unfreezingEntries,
  }
}
