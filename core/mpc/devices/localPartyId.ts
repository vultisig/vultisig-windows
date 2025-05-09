import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'

import { MpcDevice, mpcDeviceFromDeviceName } from './MpcDevice'

const localPartyIdSeparator = '-'

export const generateLocalPartyId = (device: MpcDevice) => {
  const deviceName =
    device === 'server' ? capitalizeFirstLetter(device) : device

  const number = Math.floor(1000 + Math.random() * 9000)

  return [deviceName, number].join(localPartyIdSeparator)
}

export const parseLocalPartyId = (localPartyId: string) => {
  const [deviceName, hash] = localPartyId.split(localPartyIdSeparator)

  return { deviceName, hash }
}

export const hasServer = (signers: string[]) => signers.some(isServer)

export const isServer = (device: string) =>
  mpcDeviceFromDeviceName(parseLocalPartyId(device).deviceName) === 'server'
