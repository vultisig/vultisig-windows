import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { randomIntegerInRange } from '@lib/utils/randomInRange'

type MpcDevice =
  | 'windows'
  | 'mac'
  | 'linux'
  | 'iphone'
  | 'ipad'
  | 'android'
  | 'server'

const localPartyIdSeparator = '-'

const currentMpcDevice: MpcDevice = 'windows'

export const generateLocalPartyId = (device: MpcDevice = currentMpcDevice) => {
  const deviceName =
    device === 'server' ? capitalizeFirstLetter(device) : device

  const number =
    device === 'server'
      ? randomIntegerInRange(1000, 9999)
      : randomIntegerInRange(100, 999)

  return [deviceName, number].join(localPartyIdSeparator)
}

export const parseLocalPartyId = (localPartyId: string) => {
  const [deviceName, hash] = localPartyId.split(localPartyIdSeparator)

  return { deviceName, hash }
}

export const mpcDeviceFromDeviceName = (
  deviceName: string
): MpcDevice | null => {
  const lowerCaseDeviceName = deviceName.toLowerCase()
  if (lowerCaseDeviceName in mpcDeviceType) {
    return lowerCaseDeviceName as MpcDevice
  }

  return null
}

const mpcDeviceName: Record<MpcDevice, string> = {
  windows: 'Windows',
  mac: 'Mac',
  linux: 'Linux',
  iphone: 'iPhone',
  ipad: 'iPad',
  android: 'Android',
  server: 'Server',
}

export const formatMpcDeviceName = (deviceName: string) => {
  const mpcDevice = mpcDeviceFromDeviceName(deviceName)
  if (mpcDevice) {
    return mpcDeviceName[mpcDevice]
  }

  return deviceName
}

type DeviceType = 'phone' | 'tablet' | 'desktop' | 'server'

const mpcDeviceType: Record<MpcDevice, DeviceType> = {
  windows: 'desktop',
  mac: 'desktop',
  linux: 'desktop',
  iphone: 'phone',
  ipad: 'tablet',
  android: 'phone',
  server: 'server',
}
