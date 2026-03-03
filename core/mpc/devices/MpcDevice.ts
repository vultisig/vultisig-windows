export type MpcDevice =
  | 'windows'
  | 'mac'
  | 'linux'
  | 'iphone'
  | 'ipad'
  | 'android'
  | 'server'
  | 'extension'
  | 'sdk'

const mpcDeviceName: Record<MpcDevice, string> = {
  windows: 'Windows',
  mac: 'Mac',
  linux: 'Linux',
  iphone: 'iPhone',
  ipad: 'iPad',
  android: 'Android',
  server: 'Server',
  extension: 'Extension',
  sdk: 'SDK',
}

export type DeviceType =
  | 'phone'
  | 'tablet'
  | 'desktop'
  | 'server'
  | 'browser'
  | 'sdk'

const mpcDeviceType: Record<MpcDevice, DeviceType> = {
  windows: 'desktop',
  mac: 'desktop',
  linux: 'desktop',
  iphone: 'phone',
  ipad: 'tablet',
  android: 'phone',
  server: 'server',
  extension: 'browser',
  sdk: 'sdk',
}

export const getMpcDeviceType = (deviceName: string): DeviceType | null => {
  const mpcDevice = mpcDeviceFromDeviceName(deviceName)
  return mpcDevice ? mpcDeviceType[mpcDevice] : null
}

export const formatMpcDeviceName = (deviceName: string) => {
  const mpcDevice = mpcDeviceFromDeviceName(deviceName)
  if (mpcDevice) {
    return mpcDeviceName[mpcDevice]
  }

  return deviceName
}

export const mpcDeviceFromDeviceName = (
  deviceName: string
): MpcDevice | null => {
  const lowerCaseDeviceName = deviceName.toLowerCase()
  if (Object.hasOwn(mpcDeviceType, lowerCaseDeviceName)) {
    return lowerCaseDeviceName as MpcDevice
  }

  return null
}
