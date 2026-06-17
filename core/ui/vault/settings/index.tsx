import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { LockKeyholeIcon } from '@lib/ui/icons/LockKeyholeIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { TrashCanIcon } from '@lib/ui/icons/TrashCanIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SettingsSection } from '../../settings/SettingsSection'
import { VaultSettingsBackup } from './backup'
import { DescriptionText, ListItemIconWrapper } from './vaultSettingsListStyles'

export const VaultSettingsPage: FC = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate({ id: 'settings' })} />
        }
        title={t('vault_settings')}
      />
      <PageContent gap={14} flexGrow scrollable>
        <SettingsSection title={t('vault')}>
          <ListItem
            description={
              <DescriptionText>
                {t('vault_details_description')}
              </DescriptionText>
            }
            icon={
              <ListItemIconWrapper>
                <CircleInfoIcon />
              </ListItemIconWrapper>
            }
            onClick={() => navigate({ id: 'vaultDetails' })}
            title={t('details')}
            hoverable
            showArrow
          />
          <ListItem
            description={
              <DescriptionText>
                {t('vault_details_edit_vault_description')}
              </DescriptionText>
            }
            icon={
              <ListItemIconWrapper>
                <PencilIcon />
              </ListItemIconWrapper>
            }
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
          <ListItem
            icon={
              <ListItemIconWrapper>
                <LockKeyholeIcon />
              </ListItemIconWrapper>
            }
            description={
              <DescriptionText>{t('advanced_description')}</DescriptionText>
            }
            onClick={() => navigate({ id: 'vaultSettingsAdvanced' })}
            title={t('advanced')}
            hoverable
            showArrow
          />
        </SettingsSection>
        <DeleteItem
          icon={
            <DeleteButtonIconWrapper>
              <TrashCanIcon />
            </DeleteButtonIconWrapper>
          }
          description={
            <Text color="danger" size={12}>
              {t('delete_vault_description')}
            </Text>
          }
          onClick={() => navigate({ id: 'deleteVault' })}
          status="error"
          title={<Text size={14}>{t('delete')}</Text>}
          hoverable
          showArrow
        />
      </PageContent>
    </VStack>
  )
}

const DeleteButtonIconWrapper = styled(ListItemIconWrapper)`
  color: ${getColor('danger')};
`

const DeleteItem = styled(ListItem)`
  border-radius: 12px;
`

export { ListItemIconWrapper } from './vaultSettingsListStyles'
