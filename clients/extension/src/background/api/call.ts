import { isOneOf } from '@lib/utils/array/isOneOf'

import { ExtensionApiMessage } from '../../api'
import { sendThroughInpageBackgroundChannel } from '../../channels/inpageBackground/inpage'
import { detectScriptType } from '../../messengers/detectScriptType'
import { BackgroundApiCall } from './communication/core'
import { BackgroundApiInterface, BackgroundApiMethodName } from './interface'

const backgroundApiSupportedSources = ['inpage']

export const callBackgroundApi = <M extends BackgroundApiMethodName>(
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

  return sendThroughInpageBackgroundChannel<
    BackgroundApiInterface[M]['output']
  >(message)
}
