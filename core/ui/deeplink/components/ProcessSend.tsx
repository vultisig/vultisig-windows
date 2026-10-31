import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ValueProp } from '@lib/ui/props'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'

import { SendDeeplinkData } from '../core'
import { getDeeplinkSendAmount } from '../getDeeplinkSendAmount'
import { DeeplinkVaultSelect } from './DeeplinkVaultSelect'

export const ProcessSend = ({ value }: ValueProp<SendDeeplinkData>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <DeeplinkVaultSelect
      title={t('send')}
      chain={value.chain}
      ticker={value.ticker}
      onSelect={coin =>
        navigate({
          id: 'send',
          state: {
            coin: extractCoinKey(coin),
            address: value.toAddress,
            amount: value.amount
              ? getDeeplinkSendAmount({
                  amount: value.amount,
                  decimals: coin.decimals,
                })
              : undefined,
            memo: value.memo,
          },
        })
      }
    />
  )
}
