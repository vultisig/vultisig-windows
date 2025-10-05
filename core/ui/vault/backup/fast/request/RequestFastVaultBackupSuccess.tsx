import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { Image } from '@lib/ui/image/Image'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const RequestFastVaultBackupSuccess = () => {
  const { t } = useTranslation()

  const { openUrl, goBack } = useCore()

  return (
    <VStack fullHeight>
      <PageContent justifyContent="center" alignItems="center">
        <VStack gap={24} alignItems="center">
          <Image src="/core/images/check-inbox.png" alt="" />
          <VStack alignItems="center" gap={8}>
            <Text centerHorizontally size={24} weight={600}>
              {t('success')}
            </Text>
            <Text
              as="button"
              onClick={() => openUrl('mailto:')}
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              {t('fastVaultSetup.backup.checkEmail')}
            </Text>
          </VStack>
        </VStack>
      </PageContent>
      <PageFooter>
        <Button kind="secondary" onClick={goBack}>
          {t('close')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
