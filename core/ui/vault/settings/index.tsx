import { hasServer } from '@core/mpc/devices/localPartyId'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { CircleIcon } from '@lib/ui/icons/CircleIcon'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { IconFileEdit } from '@lib/ui/icons/IconFileEdit'
import { IconShareAndroid } from '@lib/ui/icons/IconShareAndroid'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { TrashCanIcon } from '@lib/ui/icons/TrashCanIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { featureFlags } from '../../constants'
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
          {!isFastVault && (
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <IconShareAndroid />
                </ListItemIconWrapper>
              }
              description={
                <DescriptionText>
                  {t('reshare_vault_description')}
                </DescriptionText>
              }
              onClick={() => navigate({ id: 'reshareVault' })}
              title={t('reshare')}
              hoverable
              showArrow
            />
          )}
          <ListItem
            icon={
              <ListItemIconWrapper>
                <IconFileEdit />
              </ListItemIconWrapper>
            }
            description={
              <DescriptionText>
                {t('sign_custom_message_description')}
              </DescriptionText>
            }
            onClick={() => navigate({ id: 'signCustomMessage' })}
            title={t('sign')}
            hoverable
            showArrow
          />
          {featureFlags.circle && (
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <CircleIcon />
                </ListItemIconWrapper>
              }
              description={
                <DescriptionText>{t('circle_description')}</DescriptionText>
              }
              onClick={() => navigate({ id: 'circle' })}
              title={t('circle_title')}
              hoverable
              showArrow
            />
          )}
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

export const ListItemIconWrapper = styled(IconWrapper)`
  font-size: 20px;
  color: ${getColor('primaryAlt')};
`

const DeleteButtonIconWrapper = styled(ListItemIconWrapper)`
  color: ${getColor('danger')};
`

const DeleteItem = styled(ListItem)`
  border-radius: 12px;
`

export const DescriptionText = styled(Text)`
  color: ${getColor('textShyExtra')};
  font-size: 12px;
`
