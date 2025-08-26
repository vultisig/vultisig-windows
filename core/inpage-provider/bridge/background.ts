import { runBridgeBackgroundAgent } from '@lib/extension/bridge/background'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { attempt } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { Result } from '@lib/utils/types/Result'

import {
  authorizeContext,
  AuthorizedContext,
} from '../background/core/authorization'
import {
  authorizedBackgroundMethods,
  BackgroundMethod,
} from '../background/interface'
import { BackgroundMessage } from '../background/resolver'
import { backgroundResolvers } from '../background/resolvers'
import { authorizedMethods as authorizedPopupMethods } from '../popup/interface'
import { callPopupFromBackground } from '../popup/resolvers/background'
import { InpageProviderContext } from './context'
import { InpageProviderBridgeMessage } from './message'

const callBackgroundResolver = <M extends BackgroundMethod = BackgroundMethod>({
  call,
  context,
}: {
  call: BackgroundMessage<M>['call']
  context: InpageProviderContext | AuthorizedContext
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
        const getExtendedContext = async () => {
          const result: InpageProviderContext | AuthorizedContext = {
            ...initialContext,
          }

          const { options } = getRecordUnionValue(message)
          if (options?.account) {
            result.account = options.account
          }

          const requiresAuth = matchRecordUnion<
            InpageProviderBridgeMessage,
            boolean
          >(message, {
            background: ({ call }) =>
              isOneOf(getRecordUnionKey(call), authorizedBackgroundMethods),
            popup: ({ call }) =>
              isOneOf(getRecordUnionKey(call), authorizedPopupMethods),
          })

          if (!requiresAuth) return result

          return authorizeContext(result)
        }

        const context = await getExtendedContext()

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
