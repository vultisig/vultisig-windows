import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { Result } from '@lib/utils/types/Result'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { callIdQueryParam } from '../config'
import { getPopupMessageSourceId } from '../resolver'
import { PopupResolvers } from './resolvers'
import { getPopupViewCall, removePopupViewCall } from './state/calls'

const onFinish = (result: Result<PopupInterface[PopupMethod]['output']>) => {
  chrome.runtime.sendMessage({
    sourceId: getPopupMessageSourceId('popup'),
    result,
  })
  window.close()
}

export const PopupView = () => {
  const { mutate, ...mutationState } = useMutation({
    mutationFn: async () => {
      const url = new URL(window.location.href)
      const callId = url.searchParams.get(callIdQueryParam)

      if (!callId) {
        throw new Error(`No ${callIdQueryParam} query param found`)
      }

      const call = await getPopupViewCall(callId)
      if (!call) {
        throw new Error(`No call found in the storage for ${callId}`)
      }

      return call
    },
    onSuccess: async call => {
      await removePopupViewCall(call.id)
    },
    onError: error => {
      onFinish({ error })
    },
  })

  useEffect(() => {
    mutate()
  }, [mutate])

  return (
    <MatchQuery
      value={mutationState}
      success={call => {
        const method = getRecordUnionKey(call) as PopupMethod
        const input = getRecordUnionValue(call)

        const Resolver = PopupResolvers[method]

        return <Resolver input={input} onFinish={onFinish} />
      }}
      pending={() => (
        <Center>
          <Spinner />
        </Center>
      )}
    />
  )
}
