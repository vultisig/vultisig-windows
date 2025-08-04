import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'

import { StartKeysignPrompt } from '../../../mpc/keysign/prompt/StartKeysignPrompt'
import { ChainAction } from '../ChainAction'
import { useDepositKeysignPayload } from './hooks/useDepositKeysignPayload'

type DepositConfirmButtonProps = {
  depositFormData: Record<string, unknown>
  action: ChainAction
}

export const DepositConfirmButton = ({
  depositFormData,
  action,
}: DepositConfirmButtonProps) => {
  const { t } = useTranslation()
  const { invalid, invalidMessage, keysignPayloadQuery } =
    useDepositKeysignPayload({ depositFormData, action })

  if (invalid) {
    return <Text color="danger">{invalidMessage}</Text>
  }

  return (
    <MatchQuery
      value={keysignPayloadQuery}
      pending={() => <Text>{t('loading')}</Text>}
      error={error => (
        <Text>
          {t('failed_to_load')}: {extractErrorMsg(error)}
        </Text>
      )}
      success={keysignPayload => (
        <StartKeysignPrompt keysignPayload={keysignPayload} />
      )}
    />
  )
}
