import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { ChildrenProp } from '@lib/ui/props'
import { useStateCorrector } from '@lib/ui/state/useStateCorrector'
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
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
  const correctCoin = useCorrectSelectedCoin()

  const state = useStateCorrector(
    useState(initialCoin),
    useCallback(
      value => {
        const correctedCoin = correctCoin(value)

        if (!correctedCoin || correctedCoin.ticker === value.ticker) {
          return value
        }

        return correctedCoin
      },
      [correctCoin]
    )
  )

  return (
    <DepositCoinContext.Provider value={state}>
      {children}
    </DepositCoinContext.Provider>
  )
}

export const useDepositCoin = () => useContext(DepositCoinContext)
