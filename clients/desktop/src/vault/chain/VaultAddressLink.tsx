import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { useOpenUrl } from '@core/ui/state/openUrl'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { BoxIcon } from '@lib/ui/icons/BoxIcon'
import { ValueProp } from '@lib/ui/props'

import { useCurrentVaultChain } from './useCurrentVaultChain'

export const VaultAddressLink = ({ value }: ValueProp<string>) => {
  const chain = useCurrentVaultChain()

  const openUrl = useOpenUrl()

  return (
    <IconButton
      onClick={() => {
        const url = getBlockExplorerUrl({
          chain,
          entity: 'address',
          value,
        })
        openUrl(url)
      }}
      title="Block explorer"
      icon={<BoxIcon />}
    />
  )
}
