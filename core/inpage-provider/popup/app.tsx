import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { PopupMethod } from '@core/inpage-provider/popup/interface'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { usePopupCallId, useResolvePopupCallMutation } from './view/core/call'
import { VaultsOnly } from './view/flow/VaultsOnly'
import { PopupResolvers } from './view/resolvers'
import { getPopupViewCall, removePopupViewCall } from './view/state/calls'
import { PopupContextProvider } from './view/state/context'
import { PopupInputProvider } from './view/state/input'

export const PopupApp = () => {
  const { mutateAsync: resolvePopupCall } = useResolvePopupCallMutation()
  const callId = usePopupCallId()

  const { mutate, ...mutationState } = useMutation({
    mutationFn: async () => {
      const entry = await getPopupViewCall(callId)
      if (!entry) {
        throw new Error(`No call found in the storage for ${callId}`)
      }

      await removePopupViewCall(callId)

      return entry
    },
    onError: error => {
      resolvePopupCall({ result: { error }, shouldClosePopup: true })
    },
  })

  useEffect(() => {
    mutate()
  }, [mutate])

  return (
    <MatchQuery
      value={mutationState}
      success={({ call, context }) => {
        const method = getRecordUnionKey(call) as PopupMethod
        const input = getRecordUnionValue(call)

        const Resolver = PopupResolvers[method]

        return (
          <ExtensionCoreApp
            goBack={() => window.close()}
            goHome={() => window.close()}
            targetVaultId={context?.appSession?.vaultId}
          >
            <VaultsOnly>
              <PopupContextProvider value={context}>
                <PopupInputProvider value={input}>
                  <Resolver
                    input={input}
                    context={context as any}
                    onFinish={resolvePopupCall}
                  />
                </PopupInputProvider>
              </PopupContextProvider>
            </VaultsOnly>
          </ExtensionCoreApp>
        )
      }}
      pending={() => (
        <Center>
          <Spinner />
        </Center>
      )}
    />
  )
}
