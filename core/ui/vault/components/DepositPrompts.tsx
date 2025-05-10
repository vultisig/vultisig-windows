import { CoinKey } from '@core/chain/coin/Coin'
import { depositEnabledChains } from '@core/ui/vault/deposit/DepositEnabledChain'
import { Button } from '@lib/ui/buttons/Button'
import { ValueProp } from '@lib/ui/props'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../navigation/hooks/useCoreNavigate'

export const DepositPrompt = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()

  const chain = isOneOf(value.chain, depositEnabledChains)

  const navigate = useCoreNavigate()

  if (!chain) {
    return null
  }

  return (
    <Button
      onClick={() => navigate({ id: 'deposit', state: { coin: value } })}
      kind="outlined"
      style={{ textTransform: 'uppercase' }}
    >
      {t('deposit')}
    </Button>
  )
}
