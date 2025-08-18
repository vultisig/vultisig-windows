import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { Button } from '@lib/ui/buttons/Button'
import { LockKeyholeIcon } from '@lib/ui/icons/LockKeyholeIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledIcon = styled(LockKeyholeIcon)`
  background: ${getColor('foreground')};
  border-radius: 16px;
  font-size: 64px;
  padding: 16px;
`

type VaultBackupWithoutPasswordProps = OnFinishProp & {
  onPasswordRequest: () => void
}

export const VaultBackupWithoutPassword = ({
  onFinish,
  onPasswordRequest,
}: VaultBackupWithoutPasswordProps) => {
  const { t } = useTranslation()
  const { mutate: backupVault, isPending } = useBackupVaultMutation({
    onSuccess: onFinish,
  })

  return (
    <VStack fullHeight>
      <FlowPageHeader title={t('backup')} />
      <PageContent
        alignItems="center"
        justifyContent="center"
        flexGrow
        scrollable
      >
        <VStack gap={36} style={{ maxWidth: 360 }}>
          <VStack alignItems="center" gap={16}>
            <StyledIcon />
            <Text size={22} centerHorizontally>
              {t('backup_password_prompt')}
            </Text>
            <Text
              color="supporting"
              height="large"
              size={14}
              centerHorizontally
            >
              {t('backup_password_info')}
            </Text>
          </VStack>
          <VStack gap={12}>
            <Button loading={isPending} onClick={() => backupVault({})}>
              {t('backup_without_password')}
            </Button>
            <Button
              disabled={isPending}
              kind="secondary"
              onClick={onPasswordRequest}
            >
              {t('use_password')}
            </Button>
          </VStack>
        </VStack>
      </PageContent>
    </VStack>
  )
}
