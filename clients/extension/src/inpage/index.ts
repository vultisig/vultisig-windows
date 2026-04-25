// MPC note — see vultisig/vultisig-windows#3777.
// This inpage (dapp page) chunk intentionally does NOT import
// @core/ui/mpc/bootstrapMpcEngine. The inpage script runs in a dapp's realm
// and only proxies requests to the extension; it must not bundle DKLS/Schnorr
// WASM. If you add MPC code paths here, add the bootstrap import at the top
// and confirm the bundle-size impact. Types-only imports from
// @vultisig/core-mpc/types/** are safe (protobuf messages, no engine calls).
import { runBackgroundEventsInpageAgent } from '@core/inpage-provider/background/events/inpage'
import { runBridgeInpageAgent } from '@lib/extension/bridge/inpage'

import { shouldInjectProvider } from './utils/injectHelpers'
import { injectToWindow } from './utils/windowInjector'

if (shouldInjectProvider()) {
  runBridgeInpageAgent()

  runBackgroundEventsInpageAgent()

  injectToWindow()
}
