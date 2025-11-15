import { Chain } from '@core/chain/Chain'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'

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
