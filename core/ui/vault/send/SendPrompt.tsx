import { CoinKey } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export const SendPrompt = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Button
      kind="secondary"
      label={t('send')}
      onClick={() => navigate({ id: 'send', state: { coin: value } })}
      style={{ textTransform: 'uppercase' }}
    />
  )
}
