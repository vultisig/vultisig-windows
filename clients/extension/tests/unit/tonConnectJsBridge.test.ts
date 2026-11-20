import { describe, expect, it } from 'vitest'

import {
  extensionBrandConfigs,
  type ExtensionProductBrand,
} from '@clients/extension/src/brand/extensionBrandConfig'
import { TonConnectBridge } from '@clients/extension/src/inpage/providers/tonConnect/index'
import { installTonConnectJsBridge } from '@clients/extension/src/inpage/providers/tonConnect/installJsBridge'

const jsBridgeKey = 'vultisigTonWallet'

describe('installTonConnectJsBridge', () => {
  it('exposes the bridge where a wallets-list entry looks for it', () => {
    const target: Record<string, unknown> = {}
    const bridge = new TonConnectBridge()

    installTonConnectJsBridge({ target, key: jsBridgeKey, bridge })

    expect(target[jsBridgeKey]).toEqual({ tonconnect: bridge })
  })

  it('is discoverable by the SDK QA-mode scan for unlisted wallets', () => {
    const target: Record<string, unknown> = {}
    const bridge = new TonConnectBridge()

    installTonConnectJsBridge({ target, key: jsBridgeKey, bridge })

    const [, discovered] =
      Object.entries(target).find(([key]) => key === jsBridgeKey) ?? []

    expect(discovered).toEqual({
      tonconnect: expect.objectContaining({
        walletInfo: expect.objectContaining({
          name: expect.any(String),
          app_name: expect.any(String),
          image: expect.any(String),
          about_url: expect.any(String),
          platforms: [expect.any(String)],
        }),
      }),
    })
  })

  it('reports the same app name in walletInfo and the connect device info', () => {
    const bridge = new TonConnectBridge()

    expect(bridge.walletInfo.app_name).toBe(bridge.deviceInfo.appName)
  })

  it('leaves a global another wallet already owns untouched', () => {
    const existing = { tonconnect: 'other wallet' }
    const target: Record<string, unknown> = { [jsBridgeKey]: existing }

    installTonConnectJsBridge({
      target,
      key: jsBridgeKey,
      bridge: new TonConnectBridge(),
    })

    expect(target[jsBridgeKey]).toBe(existing)
  })

  it('gives each extension brand its own bridge key', () => {
    const brands: ExtensionProductBrand[] = ['vultisig', 'station']
    const keys = brands.map(
      brand => extensionBrandConfigs[brand].provider.tonConnectJsBridgeKey
    )

    expect(new Set(keys).size).toBe(brands.length)
  })
})
