import { runBridgeBackgroundAgent } from '@lib/extension/bridge/background'
import { attempt } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { Result } from '@lib/utils/types/Result'

import { BackgroundMethod } from '../background/interface'
import { backgroundResolvers } from '../background/resolvers'
import { callPopupFromBackground } from '../popup/resolvers/background'
import { InpageProviderBridgeMessage } from './message'

export const runInpageProviderBridgeBackgroundAgent = () => {
  runBridgeBackgroundAgent<InpageProviderBridgeMessage, Result>({
    handleRequest: ({ message, context, reply }) => {
      attempt(
        matchRecordUnion<InpageProviderBridgeMessage, Promise<unknown>>(
          message,
          {
            background: ({ call }) => {
              const methodName = getRecordUnionKey(call)
              const input = getRecordUnionValue(call)

              const resolver =
                backgroundResolvers[methodName as BackgroundMethod]

              return resolver({ input, context })
            },
            popup: callPopupFromBackground,
          }
        )
      ).then(reply)
    },
  })
}
