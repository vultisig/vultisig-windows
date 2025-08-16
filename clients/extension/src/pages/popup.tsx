import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { PopupView } from '@core/inpage-provider/popup/view'
import { VaultsOnly } from '@core/inpage-provider/popup/view/flow/VaultsOnly'

import { renderExtensionPage } from './core/render'

renderExtensionPage(
  <ExtensionCoreApp>
    <VaultsOnly>
      <PopupView />
    </VaultsOnly>
  </ExtensionCoreApp>
)
