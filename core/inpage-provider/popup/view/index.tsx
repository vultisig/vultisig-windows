import { PopupMethod } from '@core/inpage-provider/popup/interface'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { usePopupCallId, useResolvePopupCall } from './core/call'
import { PopupDeadEnd } from './flow/PopupDeadEnd'
import { PopupResolvers } from './resolvers'
import { getPopupViewCall, removePopupViewCall } from './state/calls'

export const PopupView = () => {
  const callId = usePopupCallId()
  const resolvePopupCall = useResolvePopupCall()

  const { mutate, ...mutationState } = useMutation({
    mutationFn: async () => {
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
      resolvePopupCall({ error })
      window.close()
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

        return <Resolver input={input} onFinish={resolvePopupCall} />
      }}
      pending={() => (
        <PopupDeadEnd>
          <Spinner />
        </PopupDeadEnd>
      )}
    />
  )
}
