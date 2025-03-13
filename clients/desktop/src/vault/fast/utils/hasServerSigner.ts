import {
  keygenDeviceFromDeviceName,
  parseLocalPartyId,
} from '../../keygen/utils/localPartyId'

export const hasServerSigner = (signers: string[]) =>
  signers.some(
    signer =>
      keygenDeviceFromDeviceName(parseLocalPartyId(signer).deviceName) ===
      'server'
  )
