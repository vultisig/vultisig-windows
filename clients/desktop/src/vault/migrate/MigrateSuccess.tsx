import { Button } from '@lib/ui/buttons/Button'
import { t } from 'i18next'
import { Trans } from 'react-i18next'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { MigrateInfoScreen } from './MigrateInfoScreen'

export const MigrateSuccess = () => {
  const navigate = useAppNavigate()

  return (
    <MigrateInfoScreen
      animation="upgrade/upgrade_success"
      title={<Trans i18nKey="upgrade_success" components={{ b: <b /> }} />}
      action={
        <Button onClick={() => navigate('vault')}>{t('go_to_vault')}</Button>
      }
    />
  )
}
