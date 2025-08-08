import { productName } from '@core/config'

type InpageBackgroundMessageSource = 'inpage' | 'background'

export const getInpageBackgroundMessageSourceId = (
  source: InpageBackgroundMessageSource
) => `${productName}-inpage-background-channel-${source}` as const

type InpageBackgroundMessageSourceId = ReturnType<
  typeof getInpageBackgroundMessageSourceId
>

type InpageBackgroundMessageKey = {
  id: string
  sourceId: InpageBackgroundMessageSourceId
}

export type InpageBackgroundMessage = InpageBackgroundMessageKey & {
  message: unknown
}

export const isInpageBackgroundChannelMessage = (
  message: unknown,
  source: InpageBackgroundMessageSource
): message is InpageBackgroundMessage =>
  typeof message === 'object' &&
  message !== null &&
  'sourceId' in message &&
  message.sourceId === getInpageBackgroundMessageSourceId(source)
