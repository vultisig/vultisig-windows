import { MigrateInfoScreen } from '@core/ui/mpc/keygen/migrate/MigrateInfoScreen'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Button } from '@lib/ui/buttons/Button'
import { OnFinishProp } from '@lib/ui/props'
import { Trans, useTranslation } from 'react-i18next'

export const MigrateIntro = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const securityType = useCurrentVaultSecurityType()

  const renderFinalScreen = () => (
    <MigrateInfoScreen
      animation="core/animations/upgrade_shares"
      title={<Trans i18nKey="upgrade_shares_info" components={{ b: <b /> }} />}
      action={<Button onClick={onFinish}>{t('next')}</Button>}
    />
  )

  return (
    <StepTransition
      from={({ onFinish }) => (
        <MigrateInfoScreen
          animation="/core/animations/upgrade.riv"
          title={
            <Trans
              i18nKey="upgrade_vault_description"
              components={{ b: <b /> }}
            />
          }
          action={<Button onClick={onFinish}>{t('upgrade_now')}</Button>}
        />
      )}
      to={() => (
        <Match
          value={securityType}
          fast={renderFinalScreen}
          secure={() => (
            <StepTransition
              from={({ onFinish }) => (
                <MigrateInfoScreen
                  animation="/core/animations/choose-vault.riv"
                  title={
                    <Trans
                      i18nKey="upgrade_all_devices"
                      components={{ b: <b /> }}
                    />
                  }
                  action={<Button onClick={onFinish}>{t('next')}</Button>}
                />
              )}
              to={() => renderFinalScreen()}
            />
          )}
        />
      )}
    />
  )
}
