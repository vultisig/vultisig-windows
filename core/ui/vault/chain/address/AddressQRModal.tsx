import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import styled from 'styled-components'

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
      <MobilePaddedContent>
        <AddressQRCard chain={chain} coin={coin} />
      </MobilePaddedContent>
    </ResponsiveModal>
  )
}

const MobilePaddedContent = styled.div`
  padding: 24px 24px 32px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    padding: 0;
  }
`
