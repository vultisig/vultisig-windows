import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Animation } from '@lib/ui/animations/Animation'
import { Button } from '@lib/ui/button'
import { t } from 'i18next'
import { Trans } from 'react-i18next'

import { MigrateInfoScreen } from './MigrateInfoScreen'
export const MigrateSuccess = () => {
  const navigate = useCoreNavigate()

  return (
    <MigrateInfoScreen
      art={<Animation src="/core/animations/upgrade-success.riv" />}
      title={<Trans i18nKey="upgrade_success" components={{ b: <b /> }} />}
      action={
        <Button
          label={t('go_to_vault')}
          onClick={() => navigate({ id: 'vault' })}
        />
      }
    />
  )
}
