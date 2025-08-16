import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { PopupView } from '@core/inpage-provider/popup/view'

import { renderExtensionPage } from './core/render'

renderExtensionPage(
  <ExtensionCoreApp>
    <PopupView />
  </ExtensionCoreApp>
)
