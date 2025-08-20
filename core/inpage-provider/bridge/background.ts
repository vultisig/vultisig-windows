import { runBridgeBackgroundAgent } from '@lib/extension/bridge/background'
import { BridgeContext } from '@lib/extension/bridge/context'
import { attempt } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { Result } from '@lib/utils/types/Result'

import { BackgroundMethod } from '../background/interface'
import { BackgroundMessage } from '../background/resolver'
import { backgroundResolvers } from '../background/resolvers'
import { callPopupFromBackground } from '../popup/resolvers/background'
import { InpageProviderBridgeMessage } from './message'

const callBackgroundResolver = <M extends BackgroundMethod = BackgroundMethod>({
  call,
  context,
}: {
  call: BackgroundMessage<M>['call']
  context: BridgeContext
}) => {
  const methodName = getRecordUnionKey(call)
  const input = getRecordUnionValue(call, methodName)

  const resolver = backgroundResolvers[methodName]

  return resolver({ input, context })
}

export const runInpageProviderBridgeBackgroundAgent = () => {
  runBridgeBackgroundAgent<InpageProviderBridgeMessage, Result>({
    handleRequest: ({ message, context, reply }) => {
      attempt(
        matchRecordUnion<InpageProviderBridgeMessage, Promise<unknown>>(
          message,
          {
            background: ({ call }) => callBackgroundResolver({ call, context }),
            popup: ({ call, options }) =>
              callPopupFromBackground({ call, options, context }),
          }
        )
      ).then(reply)
    },
  })
}
