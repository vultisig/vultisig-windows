import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { BoxIcon } from '@lib/ui/icons/BoxIcon'
import { ValueProp } from '@lib/ui/props'

import { useCurrentVaultChain } from './useCurrentVaultChain'

export const VaultAddressLink = ({ value }: ValueProp<string>) => {
  const chain = useCurrentVaultChain()

  const { openUrl } = useCore()

  return (
    <Button
      icon={<BoxIcon />}
      onClick={() => {
        const url = getBlockExplorerUrl({
          chain,
          entity: 'address',
          value,
        })
        openUrl(url)
      }}
      size="sm"
      title="Block explorer"
    />
  )
}
