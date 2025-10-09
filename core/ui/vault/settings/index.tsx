import { hasServer } from '@core/mpc/devices/localPartyId'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
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
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
            onClick={() => navigate({ id: 'signCustomMessage' })}
            title={t('sign')}
            hoverable
            showArrow
          />
        </SettingsSection>
        <ListItem
          icon={
            <ListItemIconWrapper>
              <TrashCanIcon />
            </ListItemIconWrapper>
          }
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

export const ListItemIconWrapper = styled(IconWrapper)`
  font-size: 20px;
  color: ${getColor('primaryAlt')};
`
