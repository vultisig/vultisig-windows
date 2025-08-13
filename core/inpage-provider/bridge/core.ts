import { ProviderSource } from '../source'

export const getBridgeMessageSourceId = (source: ProviderSource) =>
  `bridge-channel-${source}` as const

type BridgeMessageSourceId = ReturnType<typeof getBridgeMessageSourceId>

type BridgeMessageKey = {
  id: string
  sourceId: BridgeMessageSourceId
}

export type BridgeMessage = BridgeMessageKey & {
  message: unknown
}

export const isBridgeMessage = (
  message: unknown,
  source: ProviderSource
): message is BridgeMessage =>
  typeof message === 'object' &&
  message !== null &&
  'sourceId' in message &&
  message.sourceId === getBridgeMessageSourceId(source)
