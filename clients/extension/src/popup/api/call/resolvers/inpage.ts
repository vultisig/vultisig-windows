import { sendToBackground } from '@core/inpage-provider/bridge/inpage'
import { Result } from '@lib/utils/types/Result'

import { ExtensionApiMessage } from '../../../../api'
import { PopupApiInterface, PopupApiMethodName } from '../../interface'
import { CallPopupApiResolver, CallPopupApiResolverInput } from '../resolver'

export const callPopupApiFromInpage: CallPopupApiResolver<any> = async <
  M extends PopupApiMethodName,
>({
  call,
  options,
}: CallPopupApiResolverInput<M>): Promise<PopupApiInterface[M]['output']> => {
  const message: ExtensionApiMessage = {
    popup: {
      call,
      options,
    },
  }

  const { error, data } =
    await sendToBackground<Result<PopupApiInterface[M]['output']>>(message)

  if (data) {
    return data
  }

  throw error
}
