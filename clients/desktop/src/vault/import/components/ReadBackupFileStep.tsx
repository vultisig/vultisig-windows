import { useAppViewState } from '@clients/desktop/src/navigation/hooks/useAppViewState'
import { ReadTextFile } from '@clients/desktop/wailsjs/go/main/App'
import { isLikelyToBeDklsVaultBackup } from '@core/ui/vault/import/utils/isLikelyToBeDklsVaultBackup'
import { vaultContainerFromString } from '@core/ui/vault/import/utils/vaultContainerFromString'
import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { Button } from '@lib/ui/button'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const ReadBackupFileStep = ({
  onFinish,
}: OnFinishProp<FileBasedVaultBackupResult>) => {
  const { t } = useTranslation()
  const [{ filePath }] = useAppViewState<'importVaultFromFile'>()
  const navigateBack = useNavigateBack()

  const { mutate, ...mutationState } = useMutation({
    mutationFn: async () => {
      const fileContent = await ReadTextFile(filePath)
      const fileName = filePath.split('/').pop() || filePath

      const vaultContainer = vaultContainerFromString(fileContent)

      const result: FileBasedVaultBackupResult = {
        result: { vaultContainer },
      }

      if (
        isLikelyToBeDklsVaultBackup({
          size: fileContent.length,
          fileName,
        })
      ) {
        result.override = { libType: 'DKLS' }
      }

      return result
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
            action={<Button onClick={navigateBack}>{t('back')}</Button>}
            title={t('failed_to_import_vault')}
            message={extractErrorMsg(error)}
          />
        )}
      />
    </>
  )
}
