import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import BackupIcon from '@lib/ui/icons/BackupIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { QuestionMarkIcon } from '@lib/ui/icons/QuestionMarkIcon'
import ReshareIcon from '@lib/ui/icons/ReshareIcon'
import { SignatureIcon } from '@lib/ui/icons/SignatureIcon'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { OnClickProp } from '@lib/ui/props'
import { Text, TextColor } from '@lib/ui/text'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import {
  AutoCenteredTitle,
  Container,
  IconWrapper,
  ListItemPanel,
  TextWrapper,
} from './EditVaultPage.styles'

type SettingItem = {
  title: string
  subtitle: string
  icon: ReactNode
  textColor?: TextColor
} & OnClickProp

const EditVaultPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const appNavigate = useAppNavigate()
  const currentVault = useCurrentVault()

  if (!currentVault) {
    return <></>
  }

  const { localPartyId } = currentVault
  const items: SettingItem[] = [
    {
      title: t('details'),
      subtitle: t('vault_setting_edit_vault_details_subtitle'),
      icon: <QuestionMarkIcon />,
      onClick: () => appNavigate('vaultDetails'),
    },
    {
      title: t('backup'),
      subtitle: t('vault_setting_edit_vault_backup_subtitle'),
      icon: <BackupIcon />,
      onClick: () => appNavigate('vaultBackup'),
    },
    {
      title: t('vault_setting_edit_vault_rename_title'),
      subtitle: t('vault_setting_edit_vault_rename_subtitle'),
      icon: <SquarePenIcon />,
      onClick: () => appNavigate('vaultRename'),
    },
    {
      title: t('reshare'),
      subtitle: t('vault_setting_edit_vault_reshare_subtitle'),
      icon: <ReshareIcon />,
      onClick: () => navigate('reshareVault'),
    },
    {
      title: t('sign'),
      subtitle: t('sign_custom_message'),
      icon: <SignatureIcon />,
      onClick: () => appNavigate('signCustomMessage'),
    },
    {
      title: t('delete'),
      subtitle: t('vault_setting_edit_vault_delete_subtitle'),
      icon: <TrashIcon />,
      onClick: () => appNavigate('vaultDelete'),
      textColor: 'danger',
    },
  ]

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        data-testid="EditVaultPage-PageHeader"
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('vault_edit_page_title')}</PageHeaderTitle>}
      />
      <PageSlice>
        <AutoCenteredTitle size={18} color="contrast" weight={500}>
          {localPartyId}
        </AutoCenteredTitle>
        <VStack flexGrow gap={12}>
          {items.map(({ onClick, title, subtitle, icon, textColor }, index) => (
            <UnstyledButton key={index} onClick={onClick}>
              <ListItemPanel>
                <HStack
                  fullWidth
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <HStack gap={18}>
                    <IconWrapper>{icon}</IconWrapper>
                    <TextWrapper>
                      <Text
                        size={14}
                        weight="600"
                        color={textColor || 'contrast'}
                      >
                        {title}
                      </Text>
                      <Text size={12} color={textColor || 'supporting'}>
                        {subtitle}
                      </Text>
                    </TextWrapper>
                  </HStack>
                  <ChevronRightIcon />
                </HStack>
              </ListItemPanel>
            </UnstyledButton>
          ))}
        </VStack>
      </PageSlice>
    </Container>
  )
}

export default EditVaultPage
