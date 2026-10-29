import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ValueProp } from '@lib/ui/props'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'

import { DepositDeeplinkData } from '../core'
import { DeeplinkVaultSelect } from './DeeplinkVaultSelect'

/** Opens the Custom deposit form prefilled from a `type=Deposit` link. */
export const ProcessDeposit = ({ value }: ValueProp<DepositDeeplinkData>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <DeeplinkVaultSelect
      title={t('deposit')}
      chain={value.chain}
      ticker={value.ticker}
      onSelect={coin =>
        navigate({
          id: 'deposit',
          state: {
            coin: extractCoinKey(coin),
            action: 'custom',
            form: { amount: value.amount, customMemo: value.memo },
          },
        })
      }
    />
  )
}
