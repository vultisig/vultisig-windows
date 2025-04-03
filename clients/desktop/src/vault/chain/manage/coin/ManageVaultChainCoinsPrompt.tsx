import { Chain } from '@core/chain/Chain'
import { makeAppPath } from '@lib/ui/navigation'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ListAddButton } from '../../../../lib/ui/list/ListAddButton'

export const ManageVaultChainCoinsPrompt = ({ value }: ValueProp<Chain>) => {
  const { t } = useTranslation()

  return (
    <Link to={makeAppPath('manageVaultChainCoins', { chain: value })}>
      <ListAddButton as="div">{t('choose_tokens')}</ListAddButton>
    </Link>
  )
}
