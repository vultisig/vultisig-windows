import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChevronRightSmallIcon } from '@lib/ui/icons/ChevronRightSmallIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { Chain } from '@vultisig/core-chain/Chain'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainEntityIcon } from '../chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '../chain/metadata/getChainLogoSrc'
import { SettingsBaselineText } from '../settings/SettingsBaselineText'
import { AddressBookChainSelectionScreen } from './AddressBookChainSelectionScreen'
import {
  AddressBookChainType,
  fromAddressBookChainType,
  getAddressBookChainOptions,
  toAddressBookChainType,
} from './AddressBookChainType'

const ChainSelector = styled(HStack)`
  ${borderRadius.lg};
  align-items: center;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  box-sizing: border-box;
  cursor: pointer;
  gap: 6px;
  height: 56px;
  padding: 16px;
`

const ChainLogoSlot = styled.div`
  ${centerContent};
  ${sameDimensions(32)};
  flex-shrink: 0;
`

const ChevronSlot = styled.div`
  color: ${getColor('text')};
  font-size: 20px;
  line-height: 0;
  margin-left: auto;
`

const SelectorText = styled(SettingsBaselineText).attrs({
  as: 'span',
  height: 1.5,
  size: 16,
  weight: 500,
})``

type Props = InputProps<Chain | undefined>

export const AddressBookChainInput = ({ value, onChange }: Props) => {
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
      : getChainDisplayName(selectedChainType.chain)
    : undefined

  const logoSrc = selectedChainType
    ? selectedChainType.kind === 'evm'
      ? getChainLogoSrc(Chain.Ethereum)
      : getChainLogoSrc(selectedChainType.chain)
    : undefined

  return (
    <VStack gap={8}>
      <SettingsBaselineText color="regular" variant="stationBodyS">
        {t('chain')}
      </SettingsBaselineText>
      <ChainSelector onClick={() => setShowChainSelection(true)}>
        {selectedChainType && logoSrc ? (
          <>
            <ChainLogoSlot>
              <ChainEntityIcon value={logoSrc} style={{ fontSize: 24 }} />
            </ChainLogoSlot>
            <SelectorText color="regular">{displayName}</SelectorText>
          </>
        ) : (
          <SelectorText color="shy">{t('select')}</SelectorText>
        )}
        <ChevronSlot>
          <ChevronRightSmallIcon />
        </ChevronSlot>
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
