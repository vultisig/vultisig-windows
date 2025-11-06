import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { AddressQRModal } from '@core/ui/vault/chain/address/AddressQRModal'
import { useCurrentVaultChains } from '@core/ui/vault/state/currentVaultCoins'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import styled from 'styled-components'

const ChainItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${getColor('background')};
  border: 1px solid ${getColor('foreground')};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: ${getColor('foreground')};
    border-color: ${getColor('primary')};
  }
`

const ChainList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
`

export const ReceiveModal = ({ onClose }: OnCloseProp) => {
  const chains = useCurrentVaultChains()
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null)

  if (selectedChain) {
    return <AddressQRModal chain={selectedChain} onClose={onClose} />
  }

  return (
    <ResponsiveModal isOpen onClose={onClose}>
      <ChainList>
        <Text size={20} weight="600" color="contrast">
          Select Chain
        </Text>
        {chains.map(chain => (
          <ChainItem key={chain} onClick={() => setSelectedChain(chain)}>
            <ChainEntityIcon
              value={getChainLogoSrc(chain)}
              style={{ fontSize: 32 }}
            />
            <Text size={16} weight="500" color="contrast">
              {chain}
            </Text>
          </ChainItem>
        ))}
      </ChainList>
    </ResponsiveModal>
  )
}
