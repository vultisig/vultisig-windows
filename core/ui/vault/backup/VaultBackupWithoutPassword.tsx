import { UnreadableVaultKeySharesError } from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { FoldersIcon } from '@lib/ui/icons/FoldersIcon'
import { LockFilledIcon } from '@lib/ui/icons/LockFilledIcon'
import { LockPasswordIcon } from '@lib/ui/icons/LockPasswordIcon'
import { TriangleWarningFilledIcon } from '@lib/ui/icons/TriangleWarningFilledIcon'
import { InfoItem } from '@lib/ui/info/InfoItem'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import { Trans } from 'react-i18next'
import styled from 'styled-components'

const IconContainer = styled.div`
  ${sameDimensions(64)};
  ${centerContent};
  font-size: 32px;
  ${borderRadius.lg};
  align-self: center;
  background: ${getColor('foregroundExtra')};
  color: ${getColor('text')};
`

// The frame's body starts 22 under the header and ends 20 above the window edge.
const Content = styled(FitPageContent)`
  padding-bottom: 20px;
  padding-top: 22px;
`

type VaultBackupWithoutPasswordProps = OnFinishProp & {
  onPasswordRequest: () => void
}

const infoItems = [
  {
    icon: <LockFilledIcon />,
    i18nKey: 'backup_password_info_secure_without_password',
  },
  {
    icon: <FoldersIcon />,
    i18nKey: 'backup_password_info_encrypt_with_password',
  },
  {
    icon: <TriangleWarningFilledIcon />,
    i18nKey: 'backup_password_info_cannot_be_reset',
  },
] as const

/** Asks whether to encrypt the backup, and saves it unencrypted when declined. */
export const VaultBackupWithoutPassword = ({
  onFinish,
  onPasswordRequest,
  vaultIds,
  onBack,
}: VaultBackupWithoutPasswordProps &
  Partial<OnBackProp> & { vaultIds: string[] }) => {
  const { t } = useTranslation()
  const {
    mutate: backupVault,
    isPending,
    error,
  } = useBackupVaultMutation({
    onSuccess: onFinish,
    vaultIds,
  })

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={null} onBack={onBack} />
      <Content contentMaxWidth={360}>
        <VStack gap={24} justifyContent="center">
          <IconContainer>
            <LockPasswordIcon />
          </IconContainer>
          <VStack alignItems="center" gap={16}>
            <SettingsBaselineText
              centerHorizontally
              color="regular"
              height={24 / 22}
              letterSpacing={-0.36}
              size={22}
              weight={500}
            >
              {t('backup_password_confirmation_title')}
            </SettingsBaselineText>
            {infoItems.map(({ i18nKey, icon }) => (
              <InfoItem key={i18nKey} icon={icon}>
                <Trans i18nKey={i18nKey} components={{ b: <b /> }} />
              </InfoItem>
            ))}
          </VStack>
          <VStack gap={12}>
            <SettingsCtaButton
              disabled={isPending}
              loading={isPending}
              onClick={() => backupVault({})}
            >
              {t('backup_without_password')}
            </SettingsCtaButton>
            <SettingsCtaButton
              disabled={isPending}
              kind="secondary"
              onClick={onPasswordRequest}
            >
              {t('backup_with_password')}
            </SettingsCtaButton>
            {error && (
              <Text color="danger" size={12}>
                {error instanceof UnreadableVaultKeySharesError
                  ? t('vault_cannot_be_opened_description')
                  : t('failed_to_save_vault')}
              </Text>
            )}
          </VStack>
        </VStack>
      </Content>
    </VStack>
  )
}
