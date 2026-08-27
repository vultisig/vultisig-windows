import { tronRpcUrl } from '@vultisig/core-chain/chains/tron/config'
import { TronAccountResources } from '@vultisig/core-chain/chains/tron/resources'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import createJsonBigInt from 'json-bigint'

type TronInteger = bigint | number

type TronAccountResponse = {
  frozenV2?: Array<{
    amount?: TronInteger
    type?: 'BANDWIDTH' | 'ENERGY'
  }>
  unfrozenV2?: Array<{
    unfreeze_amount?: TronInteger
    unfreeze_expire_time?: TronInteger
  }>
}

type TronResourceResponse = {
  freeNetUsed?: TronInteger
  freeNetLimit?: TronInteger
  NetUsed?: TronInteger
  NetLimit?: TronInteger
  EnergyUsed?: TronInteger
  EnergyLimit?: TronInteger
}

const jsonBigInt = createJsonBigInt({ useNativeBigInt: true })

const toBigInt = (value: TronInteger | undefined) => BigInt(value ?? 0)

const toSafeNumber = (value: TronInteger | undefined, label: string) => {
  const result = Number(value ?? 0)

  if (!Number.isSafeInteger(result)) {
    throw new Error(`TRON ${label} exceeds JavaScript's safe integer range`)
  }

  return result
}

const queryTron = async <T>(path: string, address: string): Promise<T> => {
  const response = await queryUrl(`${tronRpcUrl}/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: { address, visible: true },
    responseType: 'text',
  })

  return jsonBigInt.parse(response) as T
}

/**
 * Reads Stake 2.0 amounts from raw JSON without a JSON-number round trip.
 * TronGrid/PublicNode return SUN fields as unquoted integers, and the shared
 * package currently parses them with `response.json()` before converting to
 * bigint. Values above 2^53 are already rounded by then, so the Windows claim
 * path owns this exact parser until the published chain package does.
 */
export const getExactTronAccountResources = async (
  address: string
): Promise<TronAccountResources> => {
  const [account, resource] = await Promise.all([
    queryTron<TronAccountResponse>('wallet/getaccount', address),
    queryTron<TronResourceResponse>('wallet/getaccountresource', address),
  ])

  const frozenV2 = account.frozenV2 ?? []
  const frozenForBandwidthSun = frozenV2
    .filter(entry => entry.type == null || entry.type === 'BANDWIDTH')
    .reduce((sum, entry) => sum + toBigInt(entry.amount), 0n)
  const frozenForEnergySun = frozenV2
    .filter(entry => entry.type === 'ENERGY')
    .reduce((sum, entry) => sum + toBigInt(entry.amount), 0n)

  const unfreezingEntries = (account.unfrozenV2 ?? [])
    .flatMap(entry => {
      if (entry.unfreeze_amount == null || entry.unfreeze_expire_time == null) {
        return []
      }

      return [
        {
          unfreezeAmountSun: toBigInt(entry.unfreeze_amount),
          expireTimeMs: toSafeNumber(
            entry.unfreeze_expire_time,
            'unfreeze expiry'
          ),
        },
      ]
    })
    .sort((a, b) => a.expireTimeMs - b.expireTimeMs)

  const freeNetUsed = toSafeNumber(resource.freeNetUsed, 'freeNetUsed')
  const freeNetLimit = toSafeNumber(resource.freeNetLimit, 'freeNetLimit')
  const netUsed = toSafeNumber(resource.NetUsed, 'NetUsed')
  const netLimit = toSafeNumber(resource.NetLimit, 'NetLimit')
  const energyUsed = toSafeNumber(resource.EnergyUsed, 'EnergyUsed')
  const energyLimit = toSafeNumber(resource.EnergyLimit, 'EnergyLimit')

  const totalBandwidth = freeNetLimit + netLimit
  const availableBandwidth = freeNetLimit - freeNetUsed + (netLimit - netUsed)

  return {
    bandwidth: {
      available: Math.max(availableBandwidth, 0),
      total: totalBandwidth,
      used: freeNetUsed + netUsed,
    },
    energy: {
      available: Math.max(energyLimit - energyUsed, 0),
      total: energyLimit,
      used: energyUsed,
    },
    frozenForBandwidthSun,
    frozenForEnergySun,
    unfreezingEntries,
  }
}
