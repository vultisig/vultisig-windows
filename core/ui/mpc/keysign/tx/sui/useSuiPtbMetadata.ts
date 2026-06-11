import { SuiMoveNormalizedFunction } from '@mysten/sui/client'
import { useQuery } from '@tanstack/react-query'
import { getSuiClient } from '@vultisig/core-chain/chains/sui/client'

import { MoveCallKey, moveCallKey } from './abi'
import { SuiTxData } from './types'

export type SuiObjectInfo = {
  /** Type tag of the on-chain object (e.g. `0x2::coin::Coin<0x2::sui::SUI>`). */
  type: string | null
}

type SuiPtbMetadata = {
  abis: Map<MoveCallKey, SuiMoveNormalizedFunction>
  objects: Map<string, SuiObjectInfo>
}

const collectMoveCallKeys = (data: SuiTxData): Set<MoveCallKey> => {
  const keys = new Set<MoveCallKey>()
  for (const cmd of data.commands) {
    if (cmd.kind === 'MoveCall') {
      keys.add(moveCallKey(cmd.package, cmd.module, cmd.function))
    }
  }
  return keys
}

const collectObjectIds = (data: SuiTxData): string[] => {
  const ids = new Set<string>()
  for (const input of data.inputs) {
    if (input.kind === 'object') {
      ids.add(input.objectId)
    }
  }
  return Array.from(ids)
}

const fetchAbis = async (
  keys: Set<MoveCallKey>
): Promise<Map<MoveCallKey, SuiMoveNormalizedFunction>> => {
  const client = getSuiClient()
  const entries = await Promise.all(
    Array.from(keys, async key => {
      const [pkg, module, fn] = key.split('::')
      try {
        const abi = await client.getNormalizedMoveFunction({
          package: pkg,
          module,
          function: fn,
        })
        return [key, abi] as const
      } catch {
        return null
      }
    })
  )
  const map = new Map<MoveCallKey, SuiMoveNormalizedFunction>()
  for (const entry of entries) {
    if (entry) map.set(entry[0], entry[1])
  }
  return map
}

const fetchObjects = async (
  ids: string[]
): Promise<Map<string, SuiObjectInfo>> => {
  const map = new Map<string, SuiObjectInfo>()
  if (ids.length === 0) return map
  const client = getSuiClient()
  const responses = await client.multiGetObjects({
    ids,
    options: { showType: true },
  })
  responses.forEach((res, idx) => {
    const id = ids[idx]
    const type = res.data?.type ?? null
    map.set(id, { type })
  })
  return map
}

/**
 * Resolves the type tag of every object referenced by the PTB and the Move
 * ABI of every distinct `MoveCall`. Both lookups run in parallel; each
 * individual call is allowed to fail without dropping the whole result —
 * the display falls back to raw IDs / by-length decoding for unresolved
 * entries. The query is cached for the popup's lifetime; the Move ABI keyed
 * by `package::module::function` never changes (immutable on Sui) so the
 * cache is durable.
 */
export const useSuiPtbMetadataQuery = (data: SuiTxData | null) =>
  useQuery({
    queryKey: [
      'suiPtbMetadata',
      data && {
        moveCalls: Array.from(collectMoveCallKeys(data)).sort(),
        objects: collectObjectIds(data).sort(),
      },
    ],
    queryFn: async (): Promise<SuiPtbMetadata> => {
      if (!data) return { abis: new Map(), objects: new Map() }
      const [abis, objects] = await Promise.all([
        fetchAbis(collectMoveCallKeys(data)),
        fetchObjects(collectObjectIds(data)),
      ])
      return { abis, objects }
    },
    enabled: !!data,
    staleTime: 5 * 60_000,
    retry: false,
  })
