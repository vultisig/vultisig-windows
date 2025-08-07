import { attempt } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { Result } from '@lib/utils/types/Result'

import { backgroundApi } from '../../background/api'
import { BackgroundApiMethodName } from '../../background/api/interface'
import { BackgroundRequestHandler } from '../../channels/inpageBackground/background'
import { callPopupApiFromBackground } from '../../popup/api/call/resolvers/background'
import { ExtensionApiMessage } from '../index'

export const extensionApiHandler = async ({
  message,
  context,
  reply,
}: BackgroundRequestHandler<ExtensionApiMessage, Result>) => {
  const result = await attempt(
    matchRecordUnion<ExtensionApiMessage, Promise<unknown>>(message, {
      background: backgroundMessage => {
        const methodName = getRecordUnionKey(backgroundMessage.call)
        const input = getRecordUnionValue(backgroundMessage.call)

        const resolver = backgroundApi[methodName as BackgroundApiMethodName]

        return resolver({ input, context })
      },
      popup: popupMessage => {
        return callPopupApiFromBackground({
          call: popupMessage.call,
          options: popupMessage.options,
        })
      },
    })
  )

  reply(result)
}
