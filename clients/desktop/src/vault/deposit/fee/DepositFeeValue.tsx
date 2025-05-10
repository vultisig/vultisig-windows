import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'

import { useDepositChainSpecific } from './DepositChainSpecificProvider'

export const DepositFeeValue = () => {
  const chainSpecific = useDepositChainSpecific()
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()

  return <>{formatFee({ chain: coinKey.chain, chainSpecific })}</>
}
