import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StartKeysignPromptWithRefresh } from '../../../mpc/keysign/start/StartKeysignPromptWithRefresh'
import { useDepositKeysignPayloadQuery } from '../keysignPayload/query'

export const DepositConfirmButton = () => {
  const { t } = useTranslation()
  const keysignPayloadQuery = useDepositKeysignPayloadQuery()
  const { data, error, isPending } = keysignPayloadQuery

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

  return (
    <StartKeysignPromptWithRefresh
      keysignPayloadQuery={keysignPayloadQuery}
      toKeysignPayload={keysign => ({ keysign })}
      promptProps={startKeysignPromptProps}
    />
  )
}
