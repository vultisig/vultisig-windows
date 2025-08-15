import {
  BackgroundInterface,
  BackgroundMethodName,
} from '@core/inpage-provider/background/interface'
import { sendToBackground } from '@core/inpage-provider/bridge/inpage'
import { Result } from '@lib/utils/types/Result'

import { ExtensionApiMessage } from '../../api'
import { BackgroundApiCall } from './communication/core'

export const callBackgroundApi = async <M extends BackgroundMethodName>(
  call: BackgroundApiCall<M>
): Promise<BackgroundInterface[M]['output']> => {
  const message: ExtensionApiMessage = {
    background: {
      call,
    },
  }

  const { error, data } =
    await sendToBackground<Result<BackgroundInterface[M]['output']>>(message)

  if (data) {
    return data
  }

  throw error
}
