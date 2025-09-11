import { Chain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { ValueProp } from '@lib/ui/props'

import { TxOverviewEvmMemo } from './TxOverviewEvmMemo'
import { TxOverviewPlainMemo } from './TxOverviewPlainMemo'

type TxOverviewMemoProps = ValueProp<string> & {
  chain: Chain
}

export const TxOverviewMemo = ({ value, chain }: TxOverviewMemoProps) => {
  const couldBeEvmContractCall =
    isChainOfKind(chain, 'evm') && value.startsWith('0x') && value !== '0x'

  if (couldBeEvmContractCall) {
    return <TxOverviewEvmMemo value={value} />
  }

  return <TxOverviewPlainMemo value={value} />
}
