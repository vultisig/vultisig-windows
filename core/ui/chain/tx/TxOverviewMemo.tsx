import { ValueProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'

import { TxOverviewEvmMemo } from './TxOverviewEvmMemo'
import { TxOverviewPlainMemo } from './TxOverviewPlainMemo'

type TxOverviewMemoProps = ValueProp<string> & {
  chain: Chain
  /**
   * Set when the memo already sits under a section titled "Transaction
   * Details", so decoded calldata renders without repeating that heading.
   */
  withinDetailsSection?: boolean
}

/** Whether a memo is EVM calldata worth decoding rather than text to print. */
export const isEvmContractCallMemo = ({ value, chain }: TxOverviewMemoProps) =>
  isChainOfKind(chain, 'evm') && value.startsWith('0x') && value !== '0x'

export const TxOverviewMemo = (props: TxOverviewMemoProps) => {
  if (isEvmContractCallMemo(props)) {
    return (
      <TxOverviewEvmMemo
        value={props.value}
        withinDetailsSection={props.withinDetailsSection}
      />
    )
  }

  return <TxOverviewPlainMemo value={props.value} />
}
