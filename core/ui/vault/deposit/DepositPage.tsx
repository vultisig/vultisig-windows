import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../state/currentVaultCoins'
import { DepositFlowController } from './DepositFlowController'
import { DepositCoinProvider } from './providers/DepositCoinProvider'

export const DepositPage = () => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = useCurrentVaultCoin(coinKey)

  return (
    <DepositCoinProvider initialValue={coin}>
      <DepositFlowController />
    </DepositCoinProvider>
  )
}
