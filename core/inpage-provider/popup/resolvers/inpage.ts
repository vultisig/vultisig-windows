import { ExtensionApiMessage } from '@clients/extension/src/api'
import { sendToBackground } from '@core/inpage-provider/bridge/inpage'
import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { Result } from '@lib/utils/types/Result'

import { PopupCallResolver, PopupCallResolverInput } from '../resolver'

export const callPopupFromInpage: PopupCallResolver = async <
  M extends PopupMethod,
>({
  call,
  options,
}: PopupCallResolverInput<M>) => {
  const message: ExtensionApiMessage = {
    popup: {
      call,
      options,
    },
  }

  const { error, data } =
    await sendToBackground<Result<PopupInterface[M]['output']>>(message)

  if (data) {
    return data
  }

  throw error
}
