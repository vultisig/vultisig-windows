import { Vault } from '@core/ui/vault/Vault'
import { OnForwardProp, TitleProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../../ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader'
import { FlowPendingPageContent } from '../../../ui/flow/FlowPendingPageContent'
import { useSaveVaultMutation } from '../../mutations/useSaveVaultMutation'

export const SaveVaultStep: React.FC<
  ValueProp<Vault> & OnForwardProp & TitleProp
> = ({ value, onForward, title }) => {
  const { t } = useTranslation()

  const { mutate, ...mutationState } = useSaveVaultMutation({
    onSuccess: onForward,
  })

  useEffect(() => {
    mutate(value)
  }, [mutate, value])

  return (
    <>
      <FlowPageHeader title={title} />
      <MatchQuery
        value={mutationState}
        pending={() => <FlowPendingPageContent title={t('saving_vault')} />}
        success={() => null}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_save_vault')}
            message={extractErrorMsg(error)}
          />
        )}
      />
    </>
  )
}
