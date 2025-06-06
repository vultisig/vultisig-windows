import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

type SendValue = {
  coin?: CoinKey
  chain?: Chain
}

export const SendPrompt = ({
  value: { coin, chain },
}: ValueProp<SendValue>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Button
      onClick={() =>
        navigate({
          id: 'send',
          state: {
            coin,
            chain,
          },
        })
      }
      style={{ textTransform: 'uppercase' }}
      type="secondary"
    >
      {t('send')}
    </Button>
  )
}
