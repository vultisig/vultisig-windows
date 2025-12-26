import { Chain } from '@core/chain/Chain'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { InputProps } from '@lib/ui/props'
import { Text, TextColor } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainEntityIcon } from '../chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '../chain/metadata/getChainLogoSrc'
import { AddressBookChainSelectionScreen } from './AddressBookChainSelectionScreen'
import {
  AddressBookChainType,
  fromAddressBookChainType,
  getAddressBookChainOptions,
  toAddressBookChainType,
} from './AddressBookChainType'

const ChainSelector = styled(HStack)`
  ${panel()};
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
  gap: 12px;
  height: 56px;
  justify-content: space-between;
`

type Props = {
  titleColor?: TextColor
} & InputProps<Chain | undefined>

export const AddressBookChainInput = ({
  value,
  onChange,
  titleColor = 'light',
}: Props) => {
  const { t } = useTranslation()
  const [showChainSelection, setShowChainSelection] = useState(false)

  const selectedChainType = value ? toAddressBookChainType(value) : undefined

  const handleChainTypeSelect = (
    chainType: AddressBookChainType | undefined
  ) => {
    if (chainType) {
      onChange?.(fromAddressBookChainType(chainType))
    }
    setShowChainSelection(false)
  }

  const displayName = selectedChainType
    ? selectedChainType.kind === 'evm'
      ? t('evm_chains')
      : selectedChainType.chain
    : undefined

  const logoSrc = selectedChainType
    ? selectedChainType.kind === 'evm'
      ? getChainLogoSrc(Chain.Ethereum)
      : getChainLogoSrc(selectedChainType.chain)
    : undefined

  return (
    <VStack gap={8}>
      <Text color={titleColor} size={12} weight="500">
        {t('chain')}
      </Text>
      <ChainSelector onClick={() => setShowChainSelection(true)}>
        {selectedChainType && logoSrc ? (
          <>
            <ChainEntityIcon value={logoSrc} style={{ fontSize: 24 }} />
            <Text color="contrast" size={14} weight="500">
              {displayName}
            </Text>
          </>
        ) : (
          <Text color="shy" size={14} weight="500">
            {t('select_chains')}
          </Text>
        )}
        <ChevronRightIcon style={{ marginLeft: 'auto', marginRight: 0 }} />
      </ChainSelector>
      {showChainSelection && (
        <AddressBookChainSelectionScreen
          value={selectedChainType}
          onChange={handleChainTypeSelect}
          options={getAddressBookChainOptions()}
        />
      )}
    </VStack>
  )
}
