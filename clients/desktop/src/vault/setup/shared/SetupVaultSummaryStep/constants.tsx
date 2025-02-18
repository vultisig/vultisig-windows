import { ArrowSplitIcon } from '../../../../lib/ui/icons/ArrowSplitIcon'
import { CircleInfoIcon } from '../../../../lib/ui/icons/CircleInfoIcon'
import { CloudCheckIcon } from '../../../../lib/ui/icons/CloudCheckIcon'
import { CloudStackIcon } from '../../../../lib/ui/icons/CloudStackIcon'
import { EmailIcon } from '../../../../lib/ui/icons/EmailIcon'
import { SetupVaultType } from '../../type/SetupVaultType'

export const getBackupItemsForVaultType = (type: SetupVaultType) => {
  const isFastVault = type === 'fast'

  return [
    {
      title: isFastVault ? 'receivedShare1Email' : 'yourVaultShares',
      icon: isFastVault ? EmailIcon : CircleInfoIcon,
    },
    {
      title: isFastVault
        ? 'share2StoredByYou'
        : 'fastVaultSetup.summary.summaryItemOneTitle',
      icon: CloudCheckIcon,
    },
    {
      title: 'fastVaultSetup.summary.summaryItemTwoTitle',
      icon: ArrowSplitIcon,
    },
    {
      title: 'fastVaultSetup.summary.summaryItemThreeTitle',
      icon: CloudStackIcon,
    },
  ]
}
