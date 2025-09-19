import { Chain } from '@core/chain/Chain'
import { EvmContractCallInfo } from '@core/chain/chains/evm/contract/call/info'
import { ValueProp } from '@lib/ui/props'

import { TxOverviewEvmMemo } from './TxOverviewEvmMemo'
import { TxOverviewPlainMemo } from './TxOverviewPlainMemo'

type TxOverviewMemoProps = ValueProp<string> & {
  chain: Chain
  evmContractCallInfo?: EvmContractCallInfo | null
}

export const TxOverviewMemo = ({
  value,
  evmContractCallInfo,
}: TxOverviewMemoProps) => {
  if (evmContractCallInfo) {
    return <TxOverviewEvmMemo value={evmContractCallInfo} />
  }
  return <TxOverviewPlainMemo value={value} />
}
