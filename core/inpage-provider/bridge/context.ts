import type { BridgeContext } from '@lib/extension/bridge/context'

export type InpageProviderContext = BridgeContext & {
  account?: string
}
