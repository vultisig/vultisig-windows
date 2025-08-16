import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { useCallback } from 'react'

import { PopupView } from './view'
import { useResolvePopupCall } from './view/core/call'
import { VaultsOnly } from './view/flow/VaultsOnly'

export const PopupApp = () => {
  const resolvePopupCall = useResolvePopupCall()

  const goBack = useCallback(() => {
    resolvePopupCall({ error: 'Popup window was closed' })
    window.close()
  }, [resolvePopupCall])

  return (
    <ExtensionCoreApp goBack={goBack}>
      <VaultsOnly>
        <PopupView />
      </VaultsOnly>
    </ExtensionCoreApp>
  )
}
