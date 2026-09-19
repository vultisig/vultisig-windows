import { OnBackProp, TitleProp } from '@lib/ui/props'
import { ReactNode } from 'react'

import { ReviewSheet } from '../../../mpc/keysign/review/ReviewSheet'
import { useIsBlockaidEnabledQuery } from '../../../storage/blockaid'
import { DepositConfirmButton } from '../DepositConfirmButton'

type DepositReviewSheetProps = OnBackProp &
  TitleProp & {
    children: ReactNode
  }

/**
 * The deposit flow's review sheet: the overview in the body, the start-keysign
 * controls pinned below. Closing it returns to the deposit form. The badge
 * reads as scanned whenever Blockaid is on, matching the status line the DeFi
 * overviews show.
 */
export const DepositReviewSheet = ({
  title,
  children,
  onBack,
}: DepositReviewSheetProps) => {
  const { data: isBlockaidEnabled } = useIsBlockaidEnabledQuery()

  return (
    <ReviewSheet
      title={title}
      onClose={onBack}
      badgeTone={isBlockaidEnabled ? 'safe' : undefined}
      footer={<DepositConfirmButton />}
    >
      {children}
    </ReviewSheet>
  )
}
