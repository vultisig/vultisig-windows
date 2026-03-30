import { ValueProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'

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
