import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useIsPasscodeRequired } from '@core/ui/passcodeEncryption/state/useIsPasscodeRequired'
import { SettingsItem } from '@core/ui/settings/SettingsItem'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { SettingsSection } from '@core/ui/settings/SettingsSection'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { CloudArrowUpIcon } from '@lib/ui/icons/CloudArrowUpIcon'
import { FileSearchIcon } from '@lib/ui/icons/FileSearchIcon'
import { LockFilledIcon } from '@lib/ui/icons/LockFilledIcon'
import { PenWritingIcon } from '@lib/ui/icons/PenWritingIcon'
import { ReferralMegaphoneIcon } from '@lib/ui/icons/ReferralMegaphoneIcon'
import { ShieldOutlineIcon } from '@lib/ui/icons/ShieldOutlineIcon'
import { TrashFilledIcon } from '@lib/ui/icons/TrashFilledIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import { PrefetchTokenApprovals } from './advanced/tokenApprovals/queries/PrefetchTokenApprovals'
import { VaultSettingsBackup } from './backup'
import { VaultSettingsContent } from './VaultSettingsContent'

/** Per-vault settings: management, security, other and delete. */
export const VaultSettingsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { client } = useCore()
  const vault = useCurrentVault()
  const addresses = useCurrentVaultAddresses()
  const hasPasscodeEncryption = useIsPasscodeRequired()

  const areReferralsEnabled = Boolean(addresses[Chain.THORChain])
  // Only desktop registers a migrate page; the extension's view is empty.
  const canMigrate =
    client === 'desktop' &&
    vault.libType !== 'DKLS' &&
    vault.libType !== 'KeyImport'

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('vault_settings')} />
      <PrefetchTokenApprovals />
      <VaultSettingsContent gap={14} flexGrow scrollable>
        <SettingsSection title={t('vault_management')}>
          <SettingsItem
            description={t('vault_details_description')}
            icon={<CircleInfoIcon />}
            onClick={() => navigate({ id: 'vaultDetails' })}
            title={t('details')}
          />
          <SettingsItem
            description={t('vault_details_edit_vault_description')}
            icon={<PenWritingIcon />}
            onClick={() => navigate({ id: 'renameVault' })}
            title={t('rename')}
          />
          {areReferralsEnabled && (
            <SettingsItem
              icon={<ReferralMegaphoneIcon />}
              onClick={() => navigate({ id: 'referral' })}
              title={t('referral_code')}
            />
          )}
        </SettingsSection>
        <SettingsSection title={t('security')}>
          <SettingsItem
            description={t('security_description')}
            icon={<ShieldOutlineIcon />}
            onClick={() => navigate({ id: 'managePasscodeEncryption' })}
            title={t('security')}
          />
          {hasPasscodeEncryption && (
            <SettingsItem
              description={t('lock_time_description')}
              icon={<LockFilledIcon />}
              onClick={() => navigate({ id: 'passcodeAutoLock' })}
              title={t('lock_time_setting')}
            />
          )}
          <VaultSettingsBackup />
        </SettingsSection>
        <SettingsSection title={t('other')}>
          {canMigrate && (
            <SettingsItem
              chevron="large"
              description={t('migrate_vault_description')}
              icon={<CloudArrowUpIcon />}
              onClick={() => navigate({ id: 'migrateVault' })}
              title={t('migrate')}
            />
          )}
          <SettingsItem
            chevron="large"
            description={t('advanced_description')}
            icon={<FileSearchIcon />}
            onClick={() => navigate({ id: 'vaultSettingsAdvanced' })}
            title={t('advanced')}
          />
        </SettingsSection>
        <SettingsSection>
          <SettingsItem
            chevron="large"
            description={t('delete_vault_description')}
            icon={<TrashFilledIcon />}
            onClick={() => navigate({ id: 'deleteVault' })}
            title={t('delete')}
            tone="danger"
          />
        </SettingsSection>
      </VaultSettingsContent>
    </VStack>
  )
}
