import { CoinKey } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { depositEnabledChains } from '@core/ui/vault/deposit/DepositEnabledChain'
import { Button } from '@lib/ui/button'
import { ValueProp } from '@lib/ui/props'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'

export const DepositPrompt = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()

  const chain = isOneOf(value.chain, depositEnabledChains)

  const navigate = useCoreNavigate()

  if (!chain) {
    return null
  }

  return (
    <Button
      label={t('deposit')}
      onClick={() => navigate({ id: 'deposit', state: { coin: value } })}
      style={{ textTransform: 'uppercase' }}
      type="secondary"
    />
  )
}
