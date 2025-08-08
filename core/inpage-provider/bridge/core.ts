type BridgeMessageSource = 'inpage' | 'background'

export const getBridgeMessageSourceId = (source: BridgeMessageSource) =>
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
  source: BridgeMessageSource
): message is BridgeMessage =>
  typeof message === 'object' &&
  message !== null &&
  'sourceId' in message &&
  message.sourceId === getBridgeMessageSourceId(source)
