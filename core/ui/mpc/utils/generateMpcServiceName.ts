import { productName } from '@core/config'
import { MpcDevice } from '@core/mpc/devices/MpcDevice'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { randomIntegerInRange } from '@lib/utils/randomInRange'

export const generateMpcServiceName = (device: MpcDevice) =>
  [
    productName,
    capitalizeFirstLetter(device),
    randomIntegerInRange(100, 999),
  ].join('-')
