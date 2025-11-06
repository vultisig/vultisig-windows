import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'

import { AddressQRCard } from './AddressQRCard'

type AddressQRModalProps = {
  chain: Chain
  coin?: CoinKey & { ticker?: string; logo?: string }
} & OnCloseProp

export const AddressQRModal = ({
  chain,
  coin,
  onClose,
}: AddressQRModalProps) => {
  return (
    <ResponsiveModal isOpen onClose={onClose}>
      <AddressQRCard chain={chain} coin={coin} />
    </ResponsiveModal>
  )
}
