import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StartKeysignPrompt } from '../../../mpc/keysign/prompt/StartKeysignPrompt'
import { useDepositKeysignPayloadQuery } from './hooks/useDepositKeysignPayloadQuery'

export const DepositConfirmButton = () => {
  const { t } = useTranslation()
  const { data, error, isPending } = useDepositKeysignPayloadQuery()

  const startKeysignPromptProps = useMemo(() => {
    if (isPending) {
      return {
        disabledMessage: t('loading'),
      }
    }

    if (error) {
      return {
        disabledMessage: extractErrorMsg(error),
      }
    }

    return {
      keysignPayload: { keysign: data },
    }
  }, [data, error, isPending, t])

  return <StartKeysignPrompt {...startKeysignPromptProps} />
}
