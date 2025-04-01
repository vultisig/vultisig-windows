import { hasServerSigner } from '../fast/utils/hasServerSigner'
import { SecureMigrateVaultPage } from '../reshare/secure/SecureMigrateVaultPage'
import { useCurrentVault } from '../state/currentVault'
import { FastMigrateVaultPage } from './fast/FastMigrateVaultPage'

export const MigrateVaultPage = () => {
  const { signers } = useCurrentVault()

  if (hasServerSigner(signers)) {
    return <FastMigrateVaultPage />
  }

  return <SecureMigrateVaultPage />
}
