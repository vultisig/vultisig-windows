import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMutation } from '@tanstack/react-query'

import { callIdQueryParam } from '../../config'
import { PopupMethod } from '../../interface'
import { getPopupMessageSourceId, PopupResponse } from '../../resolver'
import { ResolvePopupInput } from '../resolver'

export const usePopupCallId = () => {
  const url = new URL(window.location.href)

  return shouldBePresent(
    url.searchParams.get(callIdQueryParam),
    `${callIdQueryParam} query param`
  )
}

export const useResolvePopupCallMutation = () => {
  const callId = usePopupCallId()

  return useMutation({
    mutationFn: async (input: ResolvePopupInput<PopupMethod>) => {
      const message: PopupResponse<PopupMethod> = {
        ...input,
        sourceId: getPopupMessageSourceId('popup'),
        callId,
      }

      await chrome.runtime.sendMessage(message)

      return true
    },
  })
}
