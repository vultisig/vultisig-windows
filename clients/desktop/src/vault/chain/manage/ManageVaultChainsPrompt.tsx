import { makeCorePath } from '@core/ui/navigation'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ListAddButton } from '../../../lib/ui/list/ListAddButton'

export const ManageVaultChainsPrompt = () => {
  const { t } = useTranslation()
  return (
    <Link to={makeCorePath('manageVaultChains')}>
      <ListAddButton as="div">{t('choose_chains')}</ListAddButton>
    </Link>
  )
}
