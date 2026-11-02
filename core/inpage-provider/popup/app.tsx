import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { callNotFoundPopupResult } from '@core/inpage-provider/popup/error'
import { loadMpcEngine } from '@core/ui/mpc/bootstrapMpcEngine'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PrefetchViews } from '@lib/ui/navigation/PrefetchViews'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { getRecordUnionKey } from '@vultisig/lib-utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { Suspense, useEffect } from 'react'

import { popupMethods } from './interface'
import { dismissSidePanelPopup, isPopupInSidePanel } from './sidePanel/dismiss'
import { usePopupCallId, useResolvePopupCallMutation } from './view/core/call'
import { VaultsOnly } from './view/flow/VaultsOnly'
import { popupMethodsUsingMpc, popupResolvers } from './view/resolvers'
import { getPopupViewCall, removePopupViewCall } from './view/state/calls'
import { PopupContextProvider } from './view/state/context'
import { PopupInputProvider } from './view/state/input'

// The side panel stays open: leaving the request there returns it to the wallet.
const leavePopup = isPopupInSidePanel()
  ? dismissSidePanelPopup
  : () => window.close()

// Warmed after paint so approving a request doesn't wait on the SDK load.
const prefetchLoaders = { mpcEngine: loadMpcEngine }

/** Takes this window's pending call out of storage and checks its method. */
const takePopupCall = async (callId: string) => {
  const entry = await getPopupViewCall(callId)
  if (!entry) {
    throw new Error(`No call found in the storage for ${callId}`)
  }

  await removePopupViewCall(callId)

  const method = getRecordUnionKey(entry.call)
  if (!isOneOf(method, popupMethods)) {
    throw new Error(`Unknown popup method: ${method}`)
  }

  return { ...entry, method }
}

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
    mutationFn: () => takePopupCall(callId),
    // Fetch the method's screen while the shell boots from storage.
    onSuccess: ({ method }) => {
      void popupResolvers[method].load().catch(() => undefined)
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

        const Resolver = popupResolvers[method].Component

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
            <VaultsOnly>
              {popupMethodsUsingMpc[method] && (
                <PrefetchViews loaders={prefetchLoaders} />
              )}
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
