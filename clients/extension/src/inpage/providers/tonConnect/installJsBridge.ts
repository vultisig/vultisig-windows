import type { TonConnectBridge } from './index'

type InstallTonConnectJsBridgeInput = {
  target: object
  key: string
  bridge: TonConnectBridge
}

/** Enumerable so the SDK's QA-mode `Object.entries(window)` scan finds an unlisted wallet. */
export const installTonConnectJsBridge = ({
  target,
  key,
  bridge,
}: InstallTonConnectJsBridgeInput): void => {
  if (key in target) return

  Object.defineProperty(target, key, {
    value: { tonconnect: bridge },
    enumerable: true,
    configurable: false,
    writable: false,
  })
}
