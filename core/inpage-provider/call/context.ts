import { VaultAppSession } from '@core/extension/storage/appSessions'
import { BridgeContext } from '@lib/extension/bridge/context'
import { Chain } from '@vultisig/core-chain/Chain'

/**
 * An address a provider named for a call (e.g. the signer of a sign
 * request), with the chain it belongs to so it can be re-derived from vault
 * key material.
 */
export type CallAccountHint = {
  address: string
  chain: Chain
}

/** Context of a call before authorization binds it to a stored session. */
export type CallInitialContext = BridgeContext & {
  account?: CallAccountHint
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
