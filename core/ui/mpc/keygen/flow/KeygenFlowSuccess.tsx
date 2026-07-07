import { GradientText } from '@lib/ui/text'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVaultSecurityType } from '../../../vault/state/currentVault'
import { useKeygenOperation } from '../state/currentKeygenOperationType'
import { KeygenFlowSuccessContent } from './KeygenFlowSuccessContent'

const animationDuration = 6000

export const KeygenFlowSuccess = () => {
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
      navigate({ id: 'vault' })
    }, animationDuration)

    return () => clearTimeout(timeoutId)
  }, [navigate])

  return <KeygenFlowSuccessContent title={title} securityType={securityType} />
}
