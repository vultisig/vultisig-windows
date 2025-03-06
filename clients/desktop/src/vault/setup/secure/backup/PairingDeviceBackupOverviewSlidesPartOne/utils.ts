import { storage } from '../../../../../../wailsjs/go/models'

export const getDeviceNumber = (vault: storage.Vault) => {
  const { signers, local_party_id } = vault
  return signers.indexOf(local_party_id) + 1
}
