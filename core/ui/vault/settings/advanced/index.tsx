import { ManageBlockaid } from '@core/ui/chain/security/blockaid/ManageBlockaid'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsItem } from '@core/ui/settings/SettingsItem'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { SettingsSection } from '@core/ui/settings/SettingsSection'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { FilePenIcon } from '@lib/ui/icons/FilePenIcon'
import { PenWritingIcon } from '@lib/ui/icons/PenWritingIcon'
import { ShareUpRight2Icon } from '@lib/ui/icons/ShareUpRight2Icon'
import { VStack } from '@lib/ui/layout/Stack'
import { Chain } from '@vultisig/core-chain/Chain'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { useTranslation } from 'react-i18next'

import { VaultSettingsContent } from '../VaultSettingsContent'
import { CustomRpcSettingsRow } from './CustomRpcSettingsRow'

/** Vault Settings > Advanced: reshare, post-quantum key, signing and node settings. */
export const VaultSettingsAdvancedPage = () => {
  const { t } = useTranslation()
  const { client } = useCore()
  const vault = useCurrentVault()
  const navigate = useCoreNavigate()
  const isFastVault = hasServer(vault.signers)
  const ethereumAddress = useCurrentVaultAddress(Chain.Ethereum)
  const canSignCustomMessage = Boolean(ethereumAddress.trim())

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('advanced')} />
      <VaultSettingsContent flexGrow scrollable>
        <SettingsSection itemTitleVariant="subtitle">
          {!isFastVault && (
            <SettingsItem
              description={t('reshare_vault_description')}
              icon={<ShareUpRight2Icon />}
              onClick={() => navigate({ id: 'reshareVault' })}
              title={t('reshare')}
            />
          )}
          {!vault.publicKeyMldsa && (
            <SettingsItem
              description={t('post_quantum_keygen_description')}
              icon={<FilePenIcon />}
              onClick={() => navigate({ id: 'qbtcQuantumSecurityOnboarding' })}
              title={t('post_quantum_key')}
            />
          )}
          <SettingsItem
            description={
              canSignCustomMessage
                ? t('sign_custom_message_description')
                : t('sign_custom_message_unavailable_imported_no_ethereum')
            }
            icon={<PenWritingIcon />}
            onClick={
              canSignCustomMessage
                ? () => navigate({ id: 'signCustomMessage' })
                : undefined
            }
            title={t('sign')}
          />
          {client === 'desktop' && <ManageBlockaid />}
          <CustomRpcSettingsRow />
        </SettingsSection>
      </VaultSettingsContent>
    </VStack>
  )
}
