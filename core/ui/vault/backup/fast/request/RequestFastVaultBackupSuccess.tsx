import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { Image } from '@lib/ui/image/Image'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const RequestFastVaultBackupSuccess = () => {
  const { t } = useTranslation()

  const { goHome } = useCore()

  return (
    <PageContent justifyContent="space-between" alignItems="center">
      <VStack flexGrow gap={40} alignItems="center" justifyContent="center">
        <Image src="/core/images/check-inbox.png" alt="" height={250} />
        <VStack alignItems="center" gap={16}>
          <Text centerHorizontally size={28} weight={500} color="contrast">
            {t('backup_share_sent')}
          </Text>
          <Text centerHorizontally size={14} weight={500} color="shy">
            {t('backup_share_sent_description')}
          </Text>
        </VStack>
      </VStack>
      <Button style={{ width: '100%' }} onClick={goHome}>
        {t('close')}
      </Button>
    </PageContent>
  )
}
