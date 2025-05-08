import { CoinKey, coinKeyToString } from '@core/chain/coin/Coin'
import { makeCorePath } from '@core/ui/navigation'
import { depositEnabledChains } from '@core/ui/vault/deposit/DepositEnabledChain'
import { Button } from '@lib/ui/buttons/Button'
import { ValueProp } from '@lib/ui/props'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const DepositPrompt = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()

  const chain = isOneOf(value.chain, depositEnabledChains)

  if (!chain) {
    return null
  }

  return (
    <Link
      to={makeCorePath('deposit', {
        coin: coinKeyToString(value),
      })}
    >
      <Button as="div" kind="outlined" style={{ textTransform: 'uppercase' }}>
        {t('deposit')}
      </Button>
    </Link>
  )
}
