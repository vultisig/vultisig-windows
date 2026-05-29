import type { DeviceInfo, Feature } from '@tonconnect/protocol'

import { currentExtensionBrandConfig } from '../../../brand/extensionBrandConfig'

type WalletInfo = {
  name: string
  image: string
  tondns?: string
  about_url: string
}

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

export const getTonConnectWalletInfo = (): WalletInfo => ({
  name: currentExtensionBrandConfig.provider.walletPickerName,
  image: currentExtensionBrandConfig.provider.icon,
  about_url: currentExtensionBrandConfig.websiteUrl,
})
