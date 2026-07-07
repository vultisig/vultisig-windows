import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'

import { ReshareVaultIntroStep } from './ReshareVaultIntroStep'
import { ReshareWarningSheet } from './ReshareWarningSheet'

export const ReshareVaultPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { goBack } = useCore()
  const securityType = useCurrentVaultSecurityType()
  const [isWarningOpen, { set: openWarning, unset: closeWarning }] =
    useBoolean(false)

  return (
    <>
      <ReshareVaultIntroStep
        onBack={goBack}
        onStartReshare={openWarning}
        onJoinReshare={() =>
          navigate({ id: 'uploadQr', state: { title: t('join_reshare') } })
        }
      />
      {isWarningOpen && (
        <ReshareWarningSheet
          onClose={closeWarning}
          onConfirm={() =>
            match(securityType, {
              fast: () => navigate({ id: 'reshareVaultFast' }),
              secure: () => navigate({ id: 'reshareVaultSecure' }),
            })
          }
        />
      )}
    </>
  )
}
