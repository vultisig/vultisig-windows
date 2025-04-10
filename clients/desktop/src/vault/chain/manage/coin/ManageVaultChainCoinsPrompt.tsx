import { Chain } from '@core/chain/Chain'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ListAddButton } from '../../../../lib/ui/list/ListAddButton'
import { makeAppPath } from '../../../../navigation'

export const ManageVaultChainCoinsPrompt = ({ value }: ValueProp<Chain>) => {
  const { t } = useTranslation()

  return (
    <Link to={makeAppPath('manageVaultChainCoins', { chain: value })}>
      <ListAddButton as="div">{t('choose_tokens')}</ListAddButton>
    </Link>
  )
}
