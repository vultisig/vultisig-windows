import { sendToBackground } from '@core/inpage-provider/bridge/inpage'
import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { Result } from '@lib/utils/types/Result'

import { ExtensionApiMessage } from '../../../../api'
import { CallPopupResolver, CallPopupResolverInput } from '../resolver'

export const callPopupApiFromInpage: CallPopupResolver = async <
  M extends PopupMethod,
>({
  call,
  options,
}: CallPopupResolverInput<M>) => {
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
