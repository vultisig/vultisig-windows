import { CoinKey, coinKeyToString } from '@core/chain/coin/Coin'
import { Button } from '@lib/ui/buttons/Button'
import { makeAppPath } from '@lib/ui/navigation'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const SendPrompt = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()

  return (
    <Link
      to={makeAppPath('send', {
        coin: coinKeyToString(value),
      })}
    >
      <Button as="div" kind="outlined" style={{ textTransform: 'uppercase' }}>
        {t('send')}
      </Button>
    </Link>
  )
}
