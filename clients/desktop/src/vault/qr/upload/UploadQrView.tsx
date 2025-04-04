import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageContent } from '../../../ui/page/PageContent'
import { QrImageDropZone } from './QrImageDropZone'
import { UploadedQr } from './UploadedQr'
import { useProcessQrMutation } from './useProcessQrMutation'

export const UploadQrView = () => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)

  const { mutate, isPending, error } = useProcessQrMutation()

  return (
    <>
      <PageContent flexGrow justifyContent="space-between" fullWidth gap={20}>
        <VStack fullWidth alignItems="center" flexGrow gap={20}>
          <Text color="contrast" size={16} weight="700">
            {t('upload_qr_code_to_join_keysign')}
          </Text>
          {file ? (
            <UploadedQr value={file} onRemove={() => setFile(null)} />
          ) : (
            <QrImageDropZone onFinish={setFile} />
          )}
          {error && <Text color="danger">{extractErrorMsg(error)}</Text>}
        </VStack>

        <Button
          isLoading={isPending}
          onClick={() => {
            if (file) {
              mutate(file)
            }
          }}
          isDisabled={!file}
        >
          {t('continue')}
        </Button>
      </PageContent>
    </>
  )
}
