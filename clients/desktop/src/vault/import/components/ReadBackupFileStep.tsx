import { useAppViewState } from '@clients/desktop/src/navigation/hooks/useAppViewState'
import { Buffer } from 'buffer'

import { ReadFileBase64 } from '@clients/desktop/wailsjs/go/main/App'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { vaultBackupResultFromFileBytes } from '@core/ui/vault/import/utils/vaultBackupResultFromFile'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const ReadBackupFileStep = ({
  onFinish,
}: OnFinishProp<FileBasedVaultBackupResult>) => {
  const { t } = useTranslation()
  const [{ filePath }] = useAppViewState<'importVaultFromFile'>()

  const { mutate, ...mutationState } = useMutation({
    mutationFn: async () => {
      const fileName = filePath.split('/').pop() || filePath
      const base64Content = await ReadFileBase64(filePath)
      const fileBuffer = Buffer.from(base64Content, 'base64')
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      )

      return vaultBackupResultFromFileBytes({
        name: fileName,
        size: fileBuffer.byteLength,
        buffer: arrayBuffer,
      })
    },
    onSuccess: onFinish,
  })

  useEffect(mutate, [mutate])

  return (
    <>
      <FlowPageHeader title={t('import_vault')} />
      <MatchQuery
        value={mutationState}
        success={() => null}
        pending={() => <FlowPendingPageContent title={t('importing_vault')} />}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_import_vault')}
            error={error}
          />
        )}
      />
    </>
  )
}
