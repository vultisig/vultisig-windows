import { VaultAppSession } from '@core/extension/storage/appSessions'
import { BridgeContext } from '@lib/extension/bridge/context'

export type CallInitialContext = BridgeContext & {
  account?: string
}

export type AuthorizedCallContext = BridgeContext & {
  appSession: VaultAppSession
}

type UnauthorizedCallContext = BridgeContext

export type CallContext = UnauthorizedCallContext | AuthorizedCallContext

export type MethodBasedContext<
  K extends string,
  AuthorizedMethods extends string,
> = K extends AuthorizedMethods
  ? AuthorizedCallContext
  : UnauthorizedCallContext
