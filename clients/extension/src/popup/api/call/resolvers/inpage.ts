import { Result } from '@lib/utils/types/Result'

import { ExtensionApiMessage } from '../../../../api'
import { sendThroughInpageBackgroundChannel } from '../../../../channels/inpageBackground/inpage'
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
    await sendThroughInpageBackgroundChannel<
      Result<PopupApiInterface[M]['output']>
    >(message)

  if (data) {
    return data
  }

  throw error
}
