import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { callNotFoundPopupResult } from '@core/inpage-provider/popup/error'
import { PopupMethod } from '@core/inpage-provider/popup/interface'
import { loadMpcEngine } from '@core/ui/mpc/bootstrapMpcEngine'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PrefetchViews } from '@lib/ui/navigation/PrefetchViews'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { getRecordUnionKey } from '@vultisig/lib-utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { Suspense, useEffect } from 'react'

import { dismissSidePanelPopup, isPopupInSidePanel } from './sidePanel/dismiss'
import { usePopupCallId, useResolvePopupCallMutation } from './view/core/call'
import { VaultsOnly } from './view/flow/VaultsOnly'
import { PopupResolvers } from './view/resolvers'
import { popupResolverLoaders } from './view/resolvers/loaders'
import { getPopupViewCall, removePopupViewCall } from './view/state/calls'
import { PopupContextProvider } from './view/state/context'
import { PopupInputProvider } from './view/state/input'

// The side panel stays open: leaving the request there returns it to the wallet.
const leavePopup = isPopupInSidePanel()
  ? dismissSidePanelPopup
  : () => window.close()

// Warmed after paint so approving a request doesn't wait on the SDK load.
const prefetchLoaders = { mpcEngine: loadMpcEngine }

const pendingView = (
  <Center>
    <Spinner />
  </Center>
)

/**
 * The popup page for a single dApp request, shown in a popup window or in the
 * side panel. Leaving it closes the window, or takes the side panel back to
 * the wallet.
 */
export const PopupApp = () => {
  const { mutateAsync: resolvePopupCall } = useResolvePopupCallMutation()
  const callId = usePopupCallId()

  const { mutate, ...mutationState } = useMutation({
    mutationFn: async () => {
      const entry = await getPopupViewCall(callId)
      if (!entry) {
        throw new Error(`No call found in the storage for ${callId}`)
      }

      const method = getRecordUnionKey(entry.call) as PopupMethod
      // Fetch the method's screen while the shell boots from storage.
      popupResolverLoaders[method]().catch(() => undefined)

      await removePopupViewCall(callId)

      return { ...entry, method }
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
    <MatchQuery
      value={mutationState}
      success={({ call, context, method }) => {
        const input = getRecordUnionValue(call)

        const Resolver = PopupResolvers[method]

        return (
          <ExtensionCoreApp
            goBack={leavePopup}
            goHome={leavePopup}
            popNavigationHistory={() => {
              // No navigation stack in this popup; ignore steps and leave.
              leavePopup()
            }}
            targetVaultId={context?.appSession?.vaultId}
            isLimited={true}
            startupMode="instant"
          >
            <PrefetchViews loaders={prefetchLoaders} />
            <VaultsOnly>
              <PopupContextProvider value={context}>
                <PopupInputProvider value={input}>
                  <Suspense fallback={pendingView}>
                    <Resolver
                      input={input}
                      context={context as any}
                      onFinish={resolvePopupCall}
                    />
                  </Suspense>
                </PopupInputProvider>
              </PopupContextProvider>
            </VaultsOnly>
          </ExtensionCoreApp>
        )
      }}
      pending={() => pendingView}
    />
  )
}
