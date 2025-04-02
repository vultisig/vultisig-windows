import { Button } from '@lib/ui/buttons/Button'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ReadTextFile } from '../../../../wailsjs/go/main/App'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { FlowErrorPageContent } from '../../../ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader'
import { FlowPendingPageContent } from '../../../ui/flow/FlowPendingPageContent'
import { isLikelyToBeDklsVaultBackup } from '../utils/isLikelyToBeDklsVaultBackup'
import { vaultContainerFromString } from '../utils/vaultContainerFromString'
import { FileBasedVaultBackupResult } from '../VaultBakupResult'

export const ReadBackupFileStep = ({
  onFinish,
}: OnFinishProp<FileBasedVaultBackupResult>) => {
  const { filePath } = useAppPathState<'importVaultFromFile'>()

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
        result.override = { lib_type: 'DKLS' }
      }

      return result
    },
    onSuccess: onFinish,
  })

  const { t } = useTranslation()

  const goBack = useNavigateBack()

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
            action={<Button onClick={goBack}>{t('back')}</Button>}
            title={t('failed_to_import_vault')}
            message={extractErrorMsg(error)}
          />
        )}
      />
    </>
  )
}
