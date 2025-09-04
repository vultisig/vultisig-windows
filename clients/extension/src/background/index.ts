import { runBackgroundEventsEmitter } from '@core/inpage-provider/background/events/emitter'
import { runInpageProviderBridgeBackgroundAgent } from '@core/inpage-provider/bridge/background'

import { keepAliveHandler } from './handlers/keepAliveHandler'

if (!navigator.userAgent.toLowerCase().includes('firefox')) {
  ;[
    Object,
    Object.prototype,
    Function,
    Function.prototype,
    Array,
    Array.prototype,
    String,
    String.prototype,
    Number,
    Number.prototype,
    Boolean,
    Boolean.prototype,
  ].forEach(Object.freeze)
}

keepAliveHandler()

runInpageProviderBridgeBackgroundAgent()

runBackgroundEventsEmitter()
