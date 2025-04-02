import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { BoxIcon } from '@lib/ui/icons/BoxIcon'
import { ValueProp } from '@lib/ui/props'

import { BrowserOpenURL } from '../../../wailsjs/runtime'
import { useCurrentVaultChain } from './useCurrentVaultChain'

export const VaultAddressLink = ({ value }: ValueProp<string>) => {
  const chain = useCurrentVaultChain()

  return (
    <IconButton
      onClick={() => {
        const url = getBlockExplorerUrl({
          chain,
          entity: 'address',
          value,
        })
        BrowserOpenURL(url)
      }}
      title="Block explorer"
      icon={<BoxIcon />}
    />
  )
}
