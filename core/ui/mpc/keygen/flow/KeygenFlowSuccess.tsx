import { GradientText } from '@lib/ui/text'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVaultSecurityType } from '../../../vault/state/currentVault'
import { useKeygenOperation } from '../state/currentKeygenOperationType'
import { KeygenFlowSuccessContent } from './KeygenFlowSuccessContent'

const animationDuration = 6000

type KeygenFlowSuccessProps = {
  /**
   * Called instead of navigating home once the success animation has played —
   * used when this screen is an intermediate step (e.g. before the reshare
   * backup guide) rather than the terminal screen.
   */
  onFinish?: () => void
  durationMs?: number
}

export const KeygenFlowSuccess = ({
  onFinish,
  durationMs = animationDuration,
}: KeygenFlowSuccessProps = {}) => {
  const { t } = useTranslation()
  const securityType = useCurrentVaultSecurityType()
  const keygenOperation = useKeygenOperation()
  const navigate = useCoreNavigate()

  const defaultTitle = (
    <>
      <GradientText>{t('fastVaultSetup.backup.wellDone')}</GradientText>{' '}
      {t('fastVaultSetup.backup.setNewStandard')}
    </>
  )

  const title = matchRecordUnion<typeof keygenOperation, ReactNode>(
    keygenOperation,
    {
      create: () => defaultTitle,
      keyimport: () => defaultTitle,
      singleKeygen: () => defaultTitle,
      reshare: () => (
        <>
          {t('reshare_success_title')}{' '}
          <GradientText>{t('reshare_success_title_highlight')}</GradientText>
        </>
      ),
    }
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onFinish) {
        onFinish()
      } else {
        navigate({ id: 'vault' })
      }
    }, durationMs)

    return () => clearTimeout(timeoutId)
  }, [navigate, onFinish, durationMs])

  return (
    <KeygenFlowSuccessContent
      title={title}
      securityType={securityType}
      animationSource={
        'reshare' in keygenOperation ? 'vault-created' : undefined
      }
    />
  )
}
