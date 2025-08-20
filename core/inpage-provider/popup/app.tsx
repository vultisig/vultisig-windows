import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'

import { PopupView } from './view'
import { useCancelPopupCall } from './view/core/call'
import { VaultsOnly } from './view/flow/VaultsOnly'

export const PopupApp = () => {
  const cancelPopupCall = useCancelPopupCall()

  return (
    <ExtensionCoreApp goBack={cancelPopupCall}>
      <VaultsOnly>
        <PopupView />
      </VaultsOnly>
    </ExtensionCoreApp>
  )
}
