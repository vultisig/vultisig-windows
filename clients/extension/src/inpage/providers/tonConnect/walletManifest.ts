import VULTI_ICON_RAW_SVG from '@clients/extension/src/inpage/icon'
import type { DeviceInfo, Feature } from '@tonconnect/protocol'

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
    maxMessages: 1,
    extraCurrencySupported: false,
  },
]

export const getTonConnectDeviceInfo = (): DeviceInfo => ({
  platform: 'browser',
  appName: 'Vultisig',
  appVersion: '0.2.1',
  maxProtocolVersion: 2,
  features: getTonConnectFeatures(),
})

export const getTonConnectWalletInfo = (): WalletInfo => ({
  name: 'Vultisig',
  image: VULTI_ICON_RAW_SVG,
  about_url: 'https://vultisig.com',
})
