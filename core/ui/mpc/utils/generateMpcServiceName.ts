import { productName } from '@vultisig/core-config'
import { MpcDevice } from '@vultisig/core-mpc/devices/MpcDevice'
import { capitalizeFirstLetter } from '@vultisig/lib-utils/capitalizeFirstLetter'
import { randomIntegerInRange } from '@vultisig/lib-utils/randomInRange'

export const generateMpcServiceName = (device: MpcDevice) =>
  [
    productName,
    capitalizeFirstLetter(device),
    randomIntegerInRange(100, 999),
  ].join('-')
