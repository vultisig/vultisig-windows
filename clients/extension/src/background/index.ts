// Must be first: Chrome requires push / notificationclick / pushsubscriptionchange
// listeners during initial synchronous service worker evaluation.
import '../notifications/pushServiceWorkerBindings'

import { initPushExtensionRuntime } from '../notifications/handlePushEvents'
import { initExtensionBackground } from './common'

initPushExtensionRuntime()
initExtensionBackground()
