import { sendToBackground } from '@core/inpage-provider/bridge/inpage'
import {
  PopupInterface,
  PopupMethodName,
} from '@core/inpage-provider/popup/interface'
import { Result } from '@lib/utils/types/Result'

import { ExtensionApiMessage } from '../../../../api'
import { CallPopupApiResolver, CallPopupApiResolverInput } from '../resolver'

export const callPopupApiFromInpage: CallPopupApiResolver = async <
  M extends PopupMethodName,
>({
  call,
  options,
}: CallPopupApiResolverInput<M>) => {
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
