import { Chain } from '@core/chain/Chain'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { InputProps } from '@lib/ui/props'
import { OptionsProp } from '@lib/ui/props'
import { Text, TextColor } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainSelectionScreen } from '../chainSelection/ChainSelectionScreen'
import { ChainEntityIcon } from '../coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '../metadata/getChainLogoSrc'

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
}

export const ChainInput = <T extends Chain>({
  value,
  onChange,
  options,
  titleColor = 'light',
}: Props & InputProps<T> & OptionsProp<T>) => {
  const { t } = useTranslation()
  const [showChainSelection, setShowChainSelection] = useState(false)

  const handleChainSelect = (chain: T) => {
    onChange?.(chain)
    setShowChainSelection(false)
  }

  return (
    <VStack gap={8}>
      <Text color={titleColor} size={12} weight="500">
        {t('chain')}
      </Text>
      <ChainSelector onClick={() => setShowChainSelection(true)}>
        {value ? (
          <>
            <ChainEntityIcon
              value={getChainLogoSrc(value)}
              style={{ fontSize: 24 }}
            />
            <Text color="contrast" size={14} weight="500">
              {value}
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
        <ChainSelectionScreen
          value={value}
          onChange={handleChainSelect}
          options={options}
        />
      )}
    </VStack>
  )
}
