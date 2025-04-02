import { CoinKey, coinKeyToString } from '@core/chain/coin/Coin'
import { Button } from '@lib/ui/buttons/Button'
import { ValueProp } from '@lib/ui/props'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { makeAppPath } from '../../navigation'
import { depositEnabledChains } from '../deposit/DepositEnabledChain'

export const DepositPrompt = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()

  const chain = isOneOf(value.chain, depositEnabledChains)

  if (!chain) {
    return null
  }

  return (
    <Link
      to={makeAppPath('deposit', {
        coin: coinKeyToString(value),
      })}
    >
      <Button as="div" kind="outlined" style={{ textTransform: 'uppercase' }}>
        {t('deposit')}
      </Button>
    </Link>
  )
}
