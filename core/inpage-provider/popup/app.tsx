import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { callNotFoundPopupResult } from '@core/inpage-provider/popup/error'
import { PopupMethod } from '@core/inpage-provider/popup/interface'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { getRecordUnionKey } from '@vultisig/lib-utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
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
    onError: () => {
      resolvePopupCall({
        result: callNotFoundPopupResult,
        shouldClosePopup: true,
      })
    },
  })

  useEffect(() => {
    mutate()
  }, [mutate])

  return (
    // The popup has no navigation stack: it renders a single resolver and its
    // goBack/goHome close the window. The stack is still provided because the
    // core app shell below reads it, and empty is the honest value — no view
    // is current here, so the main-app-only branches keyed off the top of the
    // history correctly do not apply.
    <NavigationProvider initialValue={{ history: [] }}>
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
              popNavigationHistory={() => {
                // No navigation stack in this popup; ignore steps and close.
                window.close()
              }}
              targetVaultId={context?.appSession?.vaultId}
              isLimited={true}
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
    </NavigationProvider>
  )
}
