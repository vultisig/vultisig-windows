import { signingAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { MpcLib } from '@core/mpc/mpcLib'
import { Vault } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { recordFromKeys } from '@lib/utils/record/recordFromKeys'
import { toEntries } from '@lib/utils/record/toEntries'

import { storage } from '../../../wailsjs/go/models'

export const toStorageVault = ({
  name,
  publicKeys,
  signers,
  createdAt,
  hexChainCode,
  keyShares,
  localPartyId,
  resharePrefix,
  libType,
  order,
  folderId,
  isBackedUp,
}: Vault): storage.Vault => ({
  name: name,
  public_key_ecdsa: publicKeys.ecdsa,
  public_key_eddsa: publicKeys.eddsa,
  signers: signers,
  created_at: (createdAt ? new Date(createdAt) : new Date()).toISOString(),
  hex_chain_code: hexChainCode,
  keyshares: toEntries(keyShares).map(({ key, value }) => ({
    public_key: publicKeys[key],
    keyshare: value,
  })),
  local_party_id: localPartyId,
  reshare_prefix: resharePrefix ?? '',
  order,
  is_backed_up: isBackedUp,
  coins: [],
  lib_type: libType,
  folder_id: folderId,
  convertValues: () => {},
})

export const fromStorageVault = (
  vault: Omit<storage.Vault, 'coins' | 'convertValues'>
): Vault => {
  const publicKeys = {
    ecdsa: vault.public_key_ecdsa,
    eddsa: vault.public_key_eddsa,
  }

  const keyShares = recordFromKeys(
    signingAlgorithms,
    algorithm =>
      shouldBePresent(
        vault.keyshares.find(
          keyShare => keyShare.public_key === publicKeys[algorithm]
        )
      ).keyshare
  )
  return {
    name: vault.name,
    publicKeys: {
      ecdsa: vault.public_key_ecdsa,
      eddsa: vault.public_key_eddsa,
    },
    signers: vault.signers,
    createdAt: new Date(vault.created_at).getTime(),
    hexChainCode: vault.hex_chain_code,
    localPartyId: vault.local_party_id,
    keyShares,
    resharePrefix: vault.reshare_prefix,
    libType: vault.lib_type as MpcLib,
    order: vault.order,
    folderId: vault.folder_id,
    isBackedUp: vault.is_backed_up,
  }
}
