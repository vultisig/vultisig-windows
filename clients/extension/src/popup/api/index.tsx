import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import {
  getPopupMessageSourceId,
  PopupResponse,
} from '@core/inpage-provider/popup/resolver'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { Result } from '@lib/utils/types/Result'
import { useCallback } from 'react'

import { useAppViewState } from '../../navigation/hooks/useAppViewState'
import { PopupResolvers } from './resolvers'

export const PopupApi = () => {
  const [{ call }] = useAppViewState<'popupApi'>()

  const Resolver = PopupResolvers[getRecordUnionKey(call) as PopupMethod]

  const onFinish = useCallback(
    (result: Result<PopupInterface[PopupMethod]['output']>) => {
      const response: PopupResponse<any> = {
        sourceId: getPopupMessageSourceId('popup'),
        result,
      }

      chrome.runtime.sendMessage(response)
    },
    []
  )

  return <Resolver input={getRecordUnionValue(call)} onFinish={onFinish} />
}
