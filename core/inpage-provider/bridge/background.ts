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

const callBackgroundResolver = <M extends BackgroundMethod = BackgroundMethod>({
  call,
  context,
}: {
  call: BackgroundMessage<M>['call']
  context: CallContext
}) => {
  const methodName = getRecordUnionKey(call)
  const input = getRecordUnionValue(call, methodName)

  const resolver = backgroundResolvers[methodName] as any

  return resolver({ input, context })
}

export const runInpageProviderBridgeBackgroundAgent = () => {
  runBridgeBackgroundAgent<InpageProviderBridgeMessage, Result>({
    handleRequest: ({ message, context: initialContext, reply }) => {
      attempt(async () => {
        const requiresAuth = matchRecordUnion<
          InpageProviderBridgeMessage,
          boolean
        >(message, {
          background: ({ call }) =>
            isOneOf(getRecordUnionKey(call), authorizedBackgroundMethods),
          popup: ({ call }) =>
            isOneOf(getRecordUnionKey(call), authorizedPopupMethods),
        })

        const context = requiresAuth
          ? await authorizeContext(initialContext)
          : initialContext

        return matchRecordUnion<InpageProviderBridgeMessage, Promise<unknown>>(
          message,
          {
            background: async ({ call }) =>
              callBackgroundResolver({ call, context }),
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
