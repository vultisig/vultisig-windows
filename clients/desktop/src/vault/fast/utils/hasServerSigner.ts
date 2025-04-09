import {
  mpcDeviceFromDeviceName,
  parseLocalPartyId,
} from '@core/mpc/signers/localPartyId'

export const hasServerSigner = (signers: string[]) =>
  signers.some(
    signer =>
      mpcDeviceFromDeviceName(parseLocalPartyId(signer).deviceName) === 'server'
  )
