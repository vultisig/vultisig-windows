import { Result } from '@lib/utils/types/Result'

import { PopupInterface, PopupMethod } from '../../../interface'
import { getPopupMessageSourceId } from '../../../resolver'

export const finishPopupFlow = (
  result: Result<PopupInterface[PopupMethod]['output']>
) => {
  chrome.runtime.sendMessage({
    sourceId: getPopupMessageSourceId('popup'),
    result,
  })
  window.close()
}
