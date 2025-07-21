import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ValueProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StartKeysignPrompt } from '../../../mpc/keysign/prompt/StartKeysignPrompt'
import { useSendTerms } from './state/sendTerms'

export const SendConfirm = ({ value }: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()
  const [terms] = useSendTerms()

  const isDisabled = useMemo(() => {
    if (terms.some(term => !term)) {
      return t('terms_required')
    }
  }, [t, terms])

  return (
    <StartKeysignPrompt
      keysignPayload={{ keysign: value }}
      isDisabled={isDisabled}
    />
  )
}
