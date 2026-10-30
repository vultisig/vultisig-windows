import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { matchesChainSearch } from '@core/ui/chain/metadata/matchesChainSearch'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { tokenApprovalsChains } from './core/tokenApprovalsChains'
import { TokenApprovalsNetworkOption } from './TokenApprovalsNetworkOption'

const options = tokenApprovalsChains.map(chain => ({ chain }))

type TokenApprovalsNetworkSelectorProps = InputProps<EvmChain> & {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

/**
 * Pill that shows the selected EVM network and opens a searchable picker.
 * Approvals are listed one network at a time. The open state is owned by the
 * caller so other controls (e.g. "Switch network") can open the same picker.
 */
export const TokenApprovalsNetworkSelector = ({
  value,
  onChange,
  isOpen,
  onOpenChange,
}: TokenApprovalsNetworkSelectorProps) => {
  const { t } = useTranslation()

  return (
    <>
      <Trigger onClick={() => onOpenChange(true)}>
        <ChainEntityIcon
          value={getChainLogoSrc(value)}
          style={{ fontSize: 20 }}
        />
        <Text size={13} weight="500" color="contrast" nowrap>
          {getChainDisplayName(value)}
        </Text>
        <ChevronDownIcon />
      </Trigger>
      {isOpen ? (
        <SelectItemModal
          title={t('select_chain')}
          options={options}
          optionComponent={TokenApprovalsNetworkOption}
          filterFunction={({ chain }, query) =>
            matchesChainSearch({ chain, query: query.trim() })
          }
          getKey={({ chain }) => chain}
          onFinish={option => {
            if (option) onChange(option.chain)
            onOpenChange(false)
          }}
        />
      ) : null}
    </>
  )
}

const Trigger = styled(UnstyledButton)`
  align-items: center;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.pill};
  color: ${getColor('textShy')};
  display: inline-flex;
  flex: none;
  gap: 6px;
  padding: 6px 10px 6px 6px;

  svg {
    font-size: 16px;
  }

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`
