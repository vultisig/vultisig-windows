import { MigrateInfoScreen } from '@core/ui/mpc/keygen/migrate/MigrateInfoScreen'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Button } from '@lib/ui/buttons/Button'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Trans, useTranslation } from 'react-i18next'

export const MigrateIntro = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  return (
    <StepTransition
      from={({ onFinish }) => (
        <MigrateInfoScreen
          animation="upgrade/upgrade"
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
        <MigrateInfoScreen
          animation="choose-vault/index"
          title={
            <Trans i18nKey="upgrade_all_devices" components={{ b: <b /> }} />
          }
          action={
            <Button onClick={onFinish}>
              <HStack alignItems="center" gap={8}>
                {t('got_it')}
                <ChevronRightIcon fontSize={20} />
              </HStack>
            </Button>
          }
        />
      )}
    />
  )
}
