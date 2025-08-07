import { isOneOf } from '@lib/utils/array/isOneOf'
import { Result } from '@lib/utils/types/Result'

import { ExtensionApiMessage } from '../../api'
import { sendThroughInpageBackgroundChannel } from '../../channels/inpageBackground/inpage'
import { detectScriptType } from '../../messengers/detectScriptType'
import { BackgroundApiCall } from './communication/core'
import { BackgroundApiInterface, BackgroundApiMethodName } from './interface'

const backgroundApiSupportedSources = ['inpage']

export const callBackgroundApi = async <M extends BackgroundApiMethodName>(
  call: BackgroundApiCall<M>
): Promise<BackgroundApiInterface[M]['output']> => {
  const source = detectScriptType()

  if (!isOneOf(source, backgroundApiSupportedSources)) {
    throw new Error(`Background API is not supported in ${source}`)
  }

  const message: ExtensionApiMessage = {
    background: {
      call,
    },
  }

  const { error, data } =
    await sendThroughInpageBackgroundChannel<
      Result<BackgroundApiInterface[M]['output']>
    >(message)

  if (data) {
    return data
  }

  throw error
}
