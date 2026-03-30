import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { Chain } from '@vultisig/core-chain/Chain'

type MemoSectionProps = {
  memo: string | undefined
  chain: Chain
}

export const MemoSection = ({ memo, chain }: MemoSectionProps) => {
  if (!memo) {
    return null
  }

  return (
    <TxOverviewPanel>
      <TxOverviewMemo value={memo} chain={chain} />
    </TxOverviewPanel>
  )
}
