import { MpcDevice } from '@vultisig/core-mpc/devices/MpcDevice'
import { capitalizeFirstLetter } from '@vultisig/lib-utils/capitalizeFirstLetter'
import { randomIntegerInRange } from '@vultisig/lib-utils/randomInRange'

import { currentProductBrandConfig } from '../../product/brand'

export const generateMpcServiceName = (device: MpcDevice) =>
  [
    currentProductBrandConfig.name,
    capitalizeFirstLetter(device),
    randomIntegerInRange(100, 999),
  ].join('-')
