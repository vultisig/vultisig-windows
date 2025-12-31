import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { AddressQRCard } from '@core/ui/vault/chain/address/AddressQRCard'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'

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
    <Modal onClose={onClose} isOpen>
      <AddressQRCard chain={chain} coin={coin} />
    </Modal>
  )
}
