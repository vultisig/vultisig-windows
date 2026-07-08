import {
  isAppSessionAuthorizedForAccounts,
  isAppSessionAuthorizedForChain,
} from '@core/extension/storage/appSessionChainAuthorization'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { runBridgeBackgroundAgent } from '@lib/extension/bridge/background'
import { Chain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { attempt } from '@vultisig/lib-utils/attempt'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { getRecordUnionKey } from '@vultisig/lib-utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { Result } from '@vultisig/lib-utils/types/Result'

import { authorizeContext } from '../background/core/authorization'
import {
  authorizedBackgroundMethods,
  BackgroundMethod,
} from '../background/interface'
import { BackgroundMessage } from '../background/resolver'
import { backgroundResolvers } from '../background/resolvers'
import { AuthorizedCallContext, CallContext } from '../call/context'
import {
  AuthorizedPopupMethod,
  authorizedPopupMethods,
  PopupInterface,
  SignMessageInput,
} from '../popup/interface'
import { PopupMessage } from '../popup/resolver'
import { callPopupFromBackground } from '../popup/resolvers/background'
import { InpageProviderBridgeMessage } from './message'

/** Resolve a background call using the given context. */
function resolveBackgroundCall({
  call,
  context,
}: {
  call: BackgroundMessage<BackgroundMethod>['call']
  context: CallContext
}) {
  const methodName = getRecordUnionKey(call)
  const input = getRecordUnionValue(call, methodName)
  const resolver = backgroundResolvers[methodName] as (arg: {
    input: unknown
    context: CallContext
  }) => unknown
  return resolver({ input, context })
}

/**
 * Whether this is a `getAccount` call carrying an `appSession` in its input.
 * The `grantVaultAccess` popup echoes the freshly created session back on the
 * immediate follow-up `getAccount` (see `requestAccount`); its presence is used
 * only as a hint that a grant just happened, so authorization tolerates the
 * post-write storage race. The object's contents are never trusted — the
 * session is always re-derived from storage against the trusted origin.
 */
function hasPassedAppSession(message: InpageProviderBridgeMessage): boolean {
  return matchRecordUnion<InpageProviderBridgeMessage, boolean>(message, {
    background: ({ call }) => {
      if (getRecordUnionKey(call) !== 'getAccount') return false
      const input = getRecordUnionValue(call, 'getAccount') as {
        appSession?: unknown
      }
      return !!input?.appSession
    },
    popup: () => false,
  })
}

/** Whether this message is for an authorized method (needs app session from storage). */
function messageRequiresAuth(message: InpageProviderBridgeMessage): boolean {
  return matchRecordUnion<InpageProviderBridgeMessage, boolean>(message, {
    background: ({ call }) =>
      isOneOf(getRecordUnionKey(call), authorizedBackgroundMethods),
    popup: ({ call }) =>
      isOneOf(getRecordUnionKey(call), authorizedPopupMethods),
  })
}

function getSignMessageChain(input: SignMessageInput): Chain {
  return matchRecordUnion<SignMessageInput, Chain>(input, {
    cosmos_sign_arbitrary: ({ chain }) => chain,
    eth_signTypedData_v4: ({ chain }) => chain,
    personal_sign: ({ chain }) => chain,
    sign_message: ({ chain }) => chain,
  })
}

function getPopupAuthorizationChains(
  call: PopupMessage<AuthorizedPopupMethod>['call']
): Chain[] {
  const method = getRecordUnionKey(call)

  if (method === 'signMessage') {
    return [getSignMessageChain(getRecordUnionValue(call, method))]
  }

  if (method === 'sendTx') {
    const input = getRecordUnionValue(call, method)
    return [
      matchRecordUnion<PopupInterface['sendTx']['input'], Chain>(input, {
        keysign: ({ chain }) => chain,
        serialized: ({ chain }) => chain,
      }),
    ]
  }

  if (method === 'watchAsset') {
    return [getRecordUnionValue(call, method).chain]
  }

  return []
}

function assertPopupAuthorization({
  call,
  context,
}: {
  call: PopupMessage<AuthorizedPopupMethod>['call']
  context: AuthorizedCallContext
}) {
  if (!isAppSessionAuthorizedForAccounts(context.appSession)) {
    throw BackgroundError.Unauthorized
  }

  for (const chain of getPopupAuthorizationChains(call)) {
    if (
      !isAppSessionAuthorizedForChain({
        appSession: context.appSession,
        chain,
      })
    ) {
      throw BackgroundError.Unauthorized
    }
  }
}

async function authorizePopupContext({
  call,
  initialContext,
}: {
  call: PopupMessage<AuthorizedPopupMethod>['call']
  initialContext: CallContext
}): Promise<AuthorizedCallContext> {
  const context = await authorizeContext(initialContext)
  assertPopupAuthorization({ call, context })
  return context
}

/** Build call context: authorize from storage (bound to the trusted origin) for authorized methods. */
async function buildCallContext(
  message: InpageProviderBridgeMessage,
  initialContext: CallContext
): Promise<CallContext> {
  if (
    'popup' in message &&
    isOneOf(getRecordUnionKey(message.popup.call), authorizedPopupMethods)
  ) {
    return authorizePopupContext({
      call: message.popup.call,
      initialContext,
    })
  }
  if (messageRequiresAuth(message)) {
    return authorizeContext(initialContext, {
      retryOnMissing: hasPassedAppSession(message),
    })
  }
  return initialContext
}

export const runInpageProviderBridgeBackgroundAgent = () => {
  runBridgeBackgroundAgent<InpageProviderBridgeMessage, Result>({
    handleRequest: ({ message, context: initialContext, reply }) => {
      attempt(async () => {
        const context = await buildCallContext(message, initialContext)

        return matchRecordUnion<InpageProviderBridgeMessage, Promise<unknown>>(
          message,
          {
            background: async ({ call }) =>
              resolveBackgroundCall({ call, context }),
            popup: async ({ call, options }) =>
              callPopupFromBackground({
                call,
                options,
                context,
              }),
          }
        )
      }).then(reply)
    },
  })
}
