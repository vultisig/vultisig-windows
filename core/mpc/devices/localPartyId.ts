import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { randomIntegerInRange } from '@lib/utils/randomInRange'

import { MpcDevice } from './MpcDevice'

const localPartyIdSeparator = '-'

export const generateLocalPartyId = (device: MpcDevice) => {
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
