import { Button } from '@lib/ui/buttons/Button'
import { centerContent } from '@lib/ui/css/centerContent'
import { UserLockIcon } from '@lib/ui/icons/UserLockIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlowPageHeader } from '../../../../ui/flow/FlowPageHeader'
import { FitPageContent } from '../../../../ui/page/PageContent'
import { useBackupVaultMutation } from '../../../mutations/useBackupVaultMutation'

type VaultBackupWithoutPasswordProps = OnFinishProp & {
  onPasswordRequest: () => void
}

const IconContainer = styled.div`
  background: ${getColor('foreground')};
  font-size: 32px;
  color: ${getColor('contrast')};
  border-radius: 16px;
  padding: 16px;
  ${centerContent};
  align-self: center;
`

export const VaultBackupWithoutPassword = ({
  onFinish,
  onPasswordRequest,
}: VaultBackupWithoutPasswordProps) => {
  const { mutate: backupVault, isPending } = useBackupVaultMutation({
    onSuccess: onFinish,
  })

  const { t } = useTranslation()

  return (
    <>
      <FlowPageHeader title={t('backup')} />
      <FitPageContent contentMaxWidth={360}>
        <VStack justifyContent="center" gap={36}>
          <VStack gap={16}>
            <IconContainer>
              <UserLockIcon />
            </IconContainer>
            <Text size={22} centerHorizontally>
              {t('backup_password_prompt')}
            </Text>
            <Text
              size={14}
              color="supporting"
              height="large"
              centerHorizontally
            >
              {t('backup_password_info')}
            </Text>
          </VStack>
          <VStack gap={12}>
            <Button
              isLoading={isPending}
              kind="primary"
              onClick={() => backupVault({})}
            >
              {t('backup_without_password')}
            </Button>
            <Button
              isDisabled={isPending}
              kind="secondary"
              onClick={onPasswordRequest}
            >
              {t('use_password')}
            </Button>
          </VStack>
        </VStack>
      </FitPageContent>
    </>
  )
}
