import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultNativeCoins } from '../../state/currentVaultCoins'

export const SendCoinGuard = ({ children }: ChildrenProp) => {
  const [{ coin, chain }, setCoin] = useCoreViewState<'send'>()

  const nativeCoins = useCurrentVaultNativeCoins()
  const nativeCoinForCurrentChain =
    nativeCoins.find(coin => coin.chain === chain) || nativeCoins[0]

  useEffect(() => {
    if (!coin && nativeCoinForCurrentChain) {
      setCoin(pv => ({ ...pv, coin: nativeCoinForCurrentChain }))
    }
  }, [coin, nativeCoinForCurrentChain, setCoin])

  if (!coin) return null

  return children
}
