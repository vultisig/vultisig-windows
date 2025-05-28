import { Chain } from '@core/chain/Chain'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { panel } from '@lib/ui/panel/Panel'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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

export const ChainInput = ({ value, onChange }: InputProps<Chain>) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [state] = useCoreViewState<'chainSelection'>()
  const selectedChain = state?.selectedChain

  useEffect(() => {
    if (selectedChain) {
      onChange(selectedChain)
    }
  }, [selectedChain, onChange])

  const handleChainClick = () => {
    navigate({
      id: 'chainSelection',
      state: {
        selectedChain: value,
        onChainSelect: onChange,
      },
    })
  }

  return (
    <VStack gap={8}>
      <Text color="light" size={12} weight="500">
        {t('chain')}
      </Text>
      <ChainSelector onClick={handleChainClick}>
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
    </VStack>
  )
}
