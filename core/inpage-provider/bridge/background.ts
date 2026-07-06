import { runBridgeBackgroundAgent } from '@lib/extension/bridge/background'
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
import { CallContext } from '../call/context'
import { authorizedPopupMethods } from '../popup/interface'
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

/** Build call context: authorize from storage (bound to the trusted origin) for authorized methods. */
async function buildCallContext(
  message: InpageProviderBridgeMessage,
  initialContext: CallContext
): Promise<CallContext> {
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
