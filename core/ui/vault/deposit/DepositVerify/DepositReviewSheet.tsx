import { OnBackProp, TitleProp } from '@lib/ui/props'
import { ReactNode } from 'react'

import { ReviewSheet } from '../../../mpc/keysign/review/ReviewSheet'
import { DepositConfirmButton } from '../DepositConfirmButton'

type DepositReviewSheetProps = OnBackProp &
  TitleProp & {
    children: ReactNode
  }

/**
 * The deposit flow's review sheet: the overview in the body, the start-keysign
 * controls pinned below. Closing it returns to the deposit form. Deposits are
 * not scanned by Blockaid, so the badge carries no verdict ring.
 */
export const DepositReviewSheet = ({
  title,
  children,
  onBack,
}: DepositReviewSheetProps) => (
  <ReviewSheet title={title} onClose={onBack} footer={<DepositConfirmButton />}>
    {children}
  </ReviewSheet>
)
