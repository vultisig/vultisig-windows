import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Animation } from '@lib/ui/animations/Animation'
import { Button } from '@lib/ui/buttons/Button'
import { Trans } from 'react-i18next'
import { useTranslation } from 'react-i18next'

import { MigrateInfoScreen } from './MigrateInfoScreen'

export const MigrateSuccess = () => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <MigrateInfoScreen
      art={<Animation src="/core/animations/upgrade-success.riv" />}
      title={<Trans i18nKey="upgrade_success" components={{ b: <b /> }} />}
      action={
        <Button onClick={() => navigate({ id: 'vault' })}>
          {t('go_to_vault')}
        </Button>
      }
    />
  )
}
