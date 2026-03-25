import type { VaultAppSession } from '@core/extension/storage/appSessions'
import { runBridgeBackgroundAgent } from '@lib/extension/bridge/background'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { attempt } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { Result } from '@lib/utils/types/Result'

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

/** If this is a getAccount call with appSession in input, return that session (avoids storage race after grantVaultAccess). */
function getPassedAppSession(
  message: InpageProviderBridgeMessage
): { appSession: VaultAppSession } | null {
  const result = matchRecordUnion<
    InpageProviderBridgeMessage,
    { appSession: VaultAppSession } | false
  >(message, {
    background: ({ call }) => {
      if (getRecordUnionKey(call) !== 'getAccount') return false
      const input = getRecordUnionValue(call, 'getAccount') as {
        appSession?: VaultAppSession
      }
      if (!input?.appSession) return false
      return { appSession: input.appSession }
    },
    popup: () => false,
  })
  return result && typeof result === 'object' ? result : null
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

/** Build call context: use passed session for getAccount when present, else authorize from storage when required. */
async function buildCallContext(
  message: InpageProviderBridgeMessage,
  initialContext: CallContext
): Promise<CallContext> {
  const passedSession = getPassedAppSession(message)
  if (passedSession) {
    return { ...initialContext, appSession: passedSession.appSession }
  }
  if (messageRequiresAuth(message)) {
    return authorizeContext(initialContext)
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
