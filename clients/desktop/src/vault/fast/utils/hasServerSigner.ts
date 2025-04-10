import { parseLocalPartyId } from '@core/mpc/devices/localPartyId'
import { mpcDeviceFromDeviceName } from '@core/mpc/devices/MpcDevice'

export const hasServerSigner = (signers: string[]) =>
  signers.some(
    signer =>
      mpcDeviceFromDeviceName(parseLocalPartyId(signer).deviceName) === 'server'
  )
