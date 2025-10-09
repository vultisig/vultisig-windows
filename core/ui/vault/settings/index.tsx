import { hasServer } from '@core/mpc/devices/localPartyId'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { SignatureIcon } from '@lib/ui/icons/SignatureIcon'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { SettingsSection } from '../../settings/SettingsSection'
import { VaultSettingsBackup } from './backup'

export const VaultSettingsPage = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const navigate = useCoreNavigate()
  const isFastVault = hasServer(vault.signers)

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('vault_settings')}
      />
      <PageContent gap={14} flexGrow scrollable>
        <SettingsSection title={t('vault')}>
          <ListItem
            icon={<CircleInfoIcon fontSize={20} />}
            onClick={() => navigate({ id: 'vaultDetails' })}
            title={t('details')}
            hoverable
            showArrow
          />
          <ListItem
            icon={<SquarePenIcon fontSize={20} />}
            onClick={() => navigate({ id: 'renameVault' })}
            title={t('rename')}
            hoverable
            showArrow
          />
        </SettingsSection>

        <SettingsSection title={t('security')}>
          <VaultSettingsBackup />
        </SettingsSection>

        <SettingsSection title={t('other')}>
          {!isFastVault && (
            <ListItem
              icon={<ShareIcon fontSize={20} />}
              onClick={() => navigate({ id: 'reshareVault' })}
              title={t('reshare')}
              hoverable
              showArrow
            />
          )}
          <ListItem
            icon={<SignatureIcon fontSize={20} />}
            onClick={() => navigate({ id: 'signCustomMessage' })}
            title={t('sign')}
            hoverable
            showArrow
          />
        </SettingsSection>
        <ListItem
          icon={<TrashIcon fontSize={20} />}
          onClick={() => navigate({ id: 'deleteVault' })}
          status="error"
          title={t('delete')}
          hoverable
          showArrow
        />
      </PageContent>
    </VStack>
  )
}
