import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { Result } from '@lib/utils/types/Result'
import { useCallback } from 'react'

import { useAppViewState } from '../../navigation/hooks/useAppViewState'
import {
  getPopupApiMessageSourceId,
  PopupApiResponse,
} from './communication/core'
import { PopupApiInterface, PopupApiMethodName } from './interface'
import { popupApiResolvers } from './resolvers'

export const PopupApi = () => {
  const [{ call }] = useAppViewState<'popupApi'>()

  const Resolver =
    popupApiResolvers[getRecordUnionKey(call) as PopupApiMethodName]

  const onFinish = useCallback(
    (result: Result<PopupApiInterface[PopupApiMethodName]['output']>) => {
      const response: PopupApiResponse<any> = {
        sourceId: getPopupApiMessageSourceId('popup'),
        result,
      }

      chrome.runtime.sendMessage(response)
    },
    []
  )

  return <Resolver input={getRecordUnionValue(call)} onFinish={onFinish} />
}
