import { VaultAppSession } from '@core/extension/storage/appSessions'
import { BridgeContext } from '@lib/extension/bridge/context'

export type CallInitialContext = BridgeContext & {
  account?: string
}

export type AuthorizedCallContext = BridgeContext & {
  appSession: VaultAppSession
}

export type UnauthorizedCallContext = BridgeContext

export type CallContext = UnauthorizedCallContext | AuthorizedCallContext
