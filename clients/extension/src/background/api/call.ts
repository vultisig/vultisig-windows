import { sendToBackground } from '@core/inpage-provider/bridge/inpage'
import { Result } from '@lib/utils/types/Result'

import { ExtensionApiMessage } from '../../api'
import { BackgroundApiCall } from './communication/core'
import { BackgroundApiInterface, BackgroundApiMethodName } from './interface'

export const callBackgroundApi = async <M extends BackgroundApiMethodName>(
  call: BackgroundApiCall<M>
): Promise<BackgroundApiInterface[M]['output']> => {
  const message: ExtensionApiMessage = {
    background: {
      call,
    },
  }

  const { error, data } =
    await sendToBackground<Result<BackgroundApiInterface[M]['output']>>(message)

  if (data) {
    return data
  }

  throw error
}
