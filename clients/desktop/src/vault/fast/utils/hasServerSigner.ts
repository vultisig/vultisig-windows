import {
  mpcDeviceFromDeviceName,
  parseLocalPartyId,
} from '../../../mpc/localPartyId'

export const hasServerSigner = (signers: string[]) =>
  signers.some(
    signer =>
      mpcDeviceFromDeviceName(parseLocalPartyId(signer).deviceName) === 'server'
  )
