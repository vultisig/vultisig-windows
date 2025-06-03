import { CoinKey } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/button'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export const SwapPrompt = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Button
      onClick={() => navigate({ id: 'swap', state: { coin: value } })}
      style={{ textTransform: 'uppercase' }}
      type="secondary"
    >
      {t('swap')}
    </Button>
  )
}
