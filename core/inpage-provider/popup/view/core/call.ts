import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { Result } from '@lib/utils/types/Result'
import { useCallback } from 'react'

import { callIdQueryParam } from '../../config'
import { PopupError } from '../../error'
import { PopupInterface, PopupMethod } from '../../interface'
import { getPopupMessageSourceId } from '../../resolver'

export const usePopupCallId = () => {
  const url = new URL(window.location.href)

  return shouldBePresent(
    url.searchParams.get(callIdQueryParam),
    `${callIdQueryParam} query param`
  )
}

export const useResolvePopupCall = () => {
  const callId = usePopupCallId()

  return useCallback(
    (result: Result<PopupInterface[PopupMethod]['output']>) => {
      chrome.runtime.sendMessage({
        sourceId: getPopupMessageSourceId('popup'),
        callId,
        result,
      })
    },
    [callId]
  )
}

export const useCancelPopupCall = () => {
  const resolvePopupCall = useResolvePopupCall()

  return useCallback(() => {
    resolvePopupCall({ error: PopupError.RejectedByUser })
    window.close()
  }, [resolvePopupCall])
}
