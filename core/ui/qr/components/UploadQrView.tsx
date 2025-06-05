import { useProcessQrMutation } from '@core/ui/qr/hooks/useProcessQrMutation'
import { Button } from '@lib/ui/buttons/Button'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { QrImageDropZone } from '@lib/ui/qr/upload/QrImageDropZone'
import { UploadedQr } from '@lib/ui/qr/upload/UploadedQr'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UploadQrView = () => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const { error, isPending, mutate } = useProcessQrMutation()

  return (
    <>
      <PageContent alignItems="center" gap={16} flexGrow scrollable>
        <Text color="contrast" size={16} weight="700" centerHorizontally>
          {t('upload_qr_code_to_join_keysign')}
        </Text>
        {file ? (
          <UploadedQr value={file} onRemove={() => setFile(null)} />
        ) : (
          <QrImageDropZone onFinish={setFile} />
        )}
        {error && <Text color="danger">{extractErrorMsg(error)}</Text>}
      </PageContent>
      <PageFooter>
        <Button
          disabled={!file}
          loading={isPending}
          onClick={() => {
            if (file) mutate(file)
          }}
        >
          {t('continue')}
        </Button>
      </PageFooter>
    </>
  )
}
