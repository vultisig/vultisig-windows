import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { UploadQrView } from '@core/ui/qr/components/UploadQrView'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const UploadAddressQrView: FC<OnFinishProp<string> & OnBackProp> = ({
  onFinish,
  onBack,
}) => {
  const { t } = useTranslation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('upload_qr_code_with_address')}
      />
      <UploadQrView
        title={t('upload_qr_code_with_address')}
        onFinish={onFinish}
      />
    </VStack>
  )
}
