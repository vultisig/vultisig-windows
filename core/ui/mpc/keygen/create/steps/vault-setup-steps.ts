import { EmailIcon } from '@lib/ui/icons/EmailIcon'
import { FrameIcon } from '@lib/ui/icons/FrameIcon'
import { LeafIcon } from '@lib/ui/icons/LeafIcon'

export const fastVaultSetupSteps = [
  { icon: LeafIcon },
  { icon: EmailIcon },
  { icon: FrameIcon },
] as const

export const secureVaultSetupSteps = [{ icon: LeafIcon }] as const
