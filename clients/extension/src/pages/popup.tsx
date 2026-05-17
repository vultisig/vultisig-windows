import '../polyfills/installFirefoxProcessGlobal'

import { PopupApp } from '@core/inpage-provider/popup/app'

import { renderExtensionPage } from './core/render'

renderExtensionPage(<PopupApp />)
