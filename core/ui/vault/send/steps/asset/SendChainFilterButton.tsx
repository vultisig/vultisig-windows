import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronRightSmallIcon } from '@lib/ui/icons/ChevronRightSmallIcon'
import { CoinsIcon } from '@lib/ui/icons/CoinsIcon'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSendAssetFilter } from '../../state/assetFilter'

/** The asset step's chain filter; opens the "Select chains" page. */
export const SendChainFilterButton = () => {
  const { t } = useTranslation()
  const [{ chain, focusesChainFilter }, setFilter] = useSendAssetFilter()
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!focusesChainFilter) return

    ref.current?.focus()
    setFilter(prev => ({ ...prev, focusesChainFilter: false }))
  }, [focusesChainFilter, setFilter])

  const label = chain === null ? t('all_chains') : getChainDisplayName(chain)

  return (
    <Pill
      ref={ref}
      aria-label={`${t('chains')}: ${label}`}
      data-testid="send-chain-filter"
      onClick={() => setFilter(prev => ({ ...prev, isPickingChain: true }))}
    >
      {chain === null ? (
        <CoinsIcon />
      ) : (
        <ChainEntityIcon value={getChainLogoSrc(chain)} />
      )}
      <Text as="span" size={14} weight={500} color="contrast" cropped>
        {label}
      </Text>
      <ChevronRightSmallIcon />
    </Pill>
  )
}

const Pill = styled(UnstyledButton)`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  color: ${getColor('contrast')};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.pill};

  svg,
  img {
    flex-shrink: 0;
  }

  &:focus-visible {
    outline: 1px solid ${getColor('primaryAccentFour')};
    outline-offset: 2px;
  }
`
