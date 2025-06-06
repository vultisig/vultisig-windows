import { CoinKey } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useNavigation } from '@lib/ui/navigation/state'
import { ValueProp } from '@lib/ui/props'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { useTranslation } from 'react-i18next'

import { SharedViewId } from '../../navigation/sharedViews'

type SendValue = {
  coin: CoinKey
}

export const SendPrompt = ({ value: { coin } }: ValueProp<SendValue>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [{ history }] = useNavigation()
  const { id } = getLastItem(history)

  return (
    <Button
      onClick={() =>
        navigate({
          id: 'send',
          state: {
            coin,
            isIntentionalCoinSelection:
              (id as SharedViewId) === 'vaultChainCoinDetail',
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
