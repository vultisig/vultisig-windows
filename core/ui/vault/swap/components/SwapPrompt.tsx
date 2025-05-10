import { CoinKey } from '@core/chain/coin/Coin'
import { Button } from '@lib/ui/buttons/Button'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'

export const SwapPrompt = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Button
      onClick={() => navigate({ id: 'swap', state: { coin: value } })}
      kind="outlined"
      style={{ textTransform: 'uppercase' }}
    >
      {t('swap')}
    </Button>
  )
}
