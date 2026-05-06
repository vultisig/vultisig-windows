import { hasServer, isServer } from '@vultisig/core-mpc/devices/localPartyId'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'

export const willUsePostKeygenFastBackupPath = (
  vault: Pick<Vault, 'signers' | 'localPartyId'>
): boolean => hasServer(vault.signers) && !isServer(vault.localPartyId)
