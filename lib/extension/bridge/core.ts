import { BridgeSide } from '@lib/extension/bridge/side'

export const getBridgeMessageSourceId = (source: BridgeSide) =>
  `bridge-channel-${source}` as const

type BridgeMessageSourceId = ReturnType<typeof getBridgeMessageSourceId>

type BridgeMessageKey = {
  id: string
  sourceId: BridgeMessageSourceId
}

export type BridgeMessage<T = unknown> = BridgeMessageKey & {
  message: T
}

export const isBridgeMessage = (
  message: unknown,
  source: BridgeSide
): message is BridgeMessage =>
  typeof message === 'object' &&
  message !== null &&
  'sourceId' in message &&
  message.sourceId === getBridgeMessageSourceId(source)
