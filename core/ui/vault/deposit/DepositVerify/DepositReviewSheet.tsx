import { ReviewSheet } from '@core/ui/mpc/keysign/review/ReviewSheet'
import { DepositConfirmButton } from '@core/ui/vault/deposit/DepositConfirmButton'
import { OnBackProp, TitleProp } from '@lib/ui/props'
import { ReactNode } from 'react'

type DepositReviewSheetProps = OnBackProp &
  TitleProp & {
    children: ReactNode
  }

/**
 * The deposit flow's review sheet: the overview in the body, the start-keysign
 * controls pinned below. Closing it returns to the deposit form.
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
