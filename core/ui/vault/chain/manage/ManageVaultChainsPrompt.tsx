import { makeCorePath } from '@core/ui/navigation'
import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const ManageVaultChainsPrompt = () => {
  const { t } = useTranslation()
  return (
    <Link to={makeCorePath('manageVaultChains')}>
      <ListAddButton as="div">{t('choose_chains')}</ListAddButton>
    </Link>
  )
}
