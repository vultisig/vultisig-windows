import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Image } from '@lib/ui/image/Image'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const CheckEmail = styled(UnstyledButton)`
  text-decoration: underline;
  &:hover {
    color: ${getColor('contrast')};
  }
`

export const RequestFastVaultBackupSuccess = () => {
  const { t } = useTranslation()

  const { openUrl, goHome } = useCore()

  return (
    <VStack gap={94}>
      <VStack gap={40} alignItems="center">
        <Image src="/core/images/check-inbox.png" alt="" />
        <VStack alignItems="center" gap={16}>
          <Text centerHorizontally size={28} weight={500} color="contrast">
            {t('backup_share_sent')}
          </Text>
          <Text centerHorizontally size={14} weight={500} color="shy">
            {t('backup_share_sent_description')}
          </Text>
          <CheckEmail onClick={() => openUrl('mailto:')}>
            {t('check_email')}
          </CheckEmail>
        </VStack>
      </VStack>
      <Button onClick={goHome}>{t('close')}</Button>
    </VStack>
  )
}
