import type { DeviceInfo, Feature } from '@tonconnect/protocol'

import { currentExtensionBrandConfig } from '../../../brand/extensionBrandConfig'

type WalletPlatform = 'chrome' | 'firefox'

type WalletInfo = {
  name: string
  app_name: string
  image: string
  tondns?: string
  about_url: string
  platforms: WalletPlatform[]
}

// The build-time define is absent under vitest, hence the typeof guard.
const getWalletPlatform = (): WalletPlatform =>
  typeof __IS_FIREFOX_EXTENSION_BUILD__ !== 'undefined' &&
  __IS_FIREFOX_EXTENSION_BUILD__
    ? 'firefox'
    : 'chrome'

const getTonConnectFeatures = (): Feature[] => [
  'SendTransaction',
  {
    name: 'SendTransaction',
    maxMessages: 4,
    extraCurrencySupported: false,
  },
  {
    name: 'SignData',
    types: ['text', 'binary', 'cell'],
  },
]

export const getTonConnectDeviceInfo = (): DeviceInfo => ({
  platform: 'browser',
  appName: currentExtensionBrandConfig.provider.walletPickerName,
  appVersion: '0.2.1',
  maxProtocolVersion: 2,
  features: getTonConnectFeatures(),
})

/** Wallet metadata dApps read from the injected bridge; `app_name` must equal `deviceInfo.appName`. */
export const getTonConnectWalletInfo = (): WalletInfo => ({
  name: currentExtensionBrandConfig.provider.walletPickerName,
  app_name: currentExtensionBrandConfig.provider.walletPickerName,
  image: currentExtensionBrandConfig.provider.icon,
  about_url: currentExtensionBrandConfig.websiteUrl,
  platforms: [getWalletPlatform()],
})
