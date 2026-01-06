import { Chain } from '@core/chain/Chain'
import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { MpcLib } from '@core/mpc/mpcLib'
import { Vault, VaultKeyShares } from '@core/mpc/vault/Vault'
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
  lastPasswordVerificationTime,
  chainPublicKeys,
  chainKeyShares,
}: Vault): storage.Vault => ({
  last_password_verification_time: lastPasswordVerificationTime ?? Date.now(),
  name: name,
  public_key_ecdsa: publicKeys.ecdsa,
  public_key_eddsa: publicKeys.eddsa,
  signers: signers,
  created_at: (createdAt ? new Date(createdAt) : new Date()).toISOString(),
  hex_chain_code: hexChainCode,
  keyshares: toEntries(keyShares).map(({ key, value }) => ({
    public_key: key,
    keyshare: value,
  })),
  local_party_id: localPartyId,
  reshare_prefix: resharePrefix ?? '',
  order,
  is_backed_up: isBackedUp,
  coins: [],
  lib_type: libType,
  folder_id: folderId,
  chain_public_keys: chainPublicKeys
    ? JSON.stringify(chainPublicKeys)
    : undefined,
  chain_key_shares: chainKeyShares ? JSON.stringify(chainKeyShares) : undefined,
  convertValues: () => {},
})

export const fromStorageVault = (
  vault: Omit<storage.Vault, 'coins' | 'convertValues'>
): Vault => {
  const publicKeys = {
    ecdsa: vault.public_key_ecdsa,
    eddsa: vault.public_key_eddsa,
  }

  const keyShares: VaultKeyShares = {} as any
  vault.keyshares.forEach(keyShare => {
    if (keyShare.public_key === 'ecdsa' || keyShare.public_key === 'eddsa') {
      keyShares[keyShare.public_key as SignatureAlgorithm] = keyShare.keyshare
    }
  })

  const chainPublicKeys = vault.chain_public_keys
    ? (JSON.parse(vault.chain_public_keys) as Partial<Record<Chain, string>>)
    : undefined

  const chainKeyShares = vault.chain_key_shares
    ? (JSON.parse(vault.chain_key_shares) as Partial<Record<Chain, string>>)
    : undefined

  return {
    lastPasswordVerificationTime: vault.last_password_verification_time,
    name: vault.name,
    publicKeys,
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
    chainPublicKeys,
    chainKeyShares,
  }
}
