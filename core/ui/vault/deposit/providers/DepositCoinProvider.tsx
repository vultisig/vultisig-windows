import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { ChildrenProp } from '@lib/ui/props'
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useCorrectSelectedCoin } from '../hooks/useCorrectSelectedCoin'

const DepositCoinContext = createContext<
  [AccountCoin, Dispatch<SetStateAction<AccountCoin>>]
>(null!)

export const DepositCoinProvider = ({ children }: ChildrenProp) => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const initialCoin = useCurrentVaultCoin(coinKey)

  const state = useState(initialCoin)

  const [coin, setCoin] = state

  const correctedCoin = useCorrectSelectedCoin({
    currentDepositCoin: coin,
  })

  if (correctedCoin && coin !== correctedCoin) {
    setCoin(correctedCoin)
    return
  }

  return (
    <DepositCoinContext.Provider value={state}>
      {children}
    </DepositCoinContext.Provider>
  )
}

export const useDepositCoin = () => useContext(DepositCoinContext)
