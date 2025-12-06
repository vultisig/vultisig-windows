import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { SearchChain } from './SearchChain'

export const DefiPortfolioHeader = () => {
  const { colors } = useTheme()
  const navigate = useCoreNavigate()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const { t } = useTranslation()

  return (
    <Wrapper>
      <AnimatePresence initial={false}>
        {!isSearchExpanded && (
          <TabsHeaderMotion
            key="defi-tabs"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <TabText size={16} weight="500">
              {t('portfolio')}
            </TabText>
            <ActiveIndicator />
          </TabsHeaderMotion>
        )}
      </AnimatePresence>
      <TrailingGroup
        layout
        animate={{ flexGrow: isSearchExpanded ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <SearchArea
          layout
          animate={{
            flexGrow: isSearchExpanded ? 1 : 0,
            flexBasis: isSearchExpanded ? '100%' : 'auto',
          }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <SearchChain
            onOpenChange={setIsSearchExpanded}
            isFullWidth={isSearchExpanded}
          />
        </SearchArea>
        <AnimatePresence initial={false}>
          {!isSearchExpanded && (
            <ManageButtonMotion
              key="manage-defi-chains"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <IconButton
                kind="secondary"
                onClick={() => navigate({ id: 'manageDefiChains' })}
                style={{
                  color: colors.primaryAccentFour.toCssValue(),
                }}
                size="lg"
              >
                <CryptoWalletPenIcon />
              </IconButton>
            </ManageButtonMotion>
          )}
        </AnimatePresence>
      </TrailingGroup>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  })};
`

const TabsHeaderContainer = styled.div`
  ${hStack({
    gap: 12,
    alignItems: 'center',
  })};
  position: relative;
`

const TabsHeaderMotion = motion(TabsHeaderContainer)

const TabText = styled(Text)`
  color: ${getColor('contrast')};
`

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: ${getColor('primary')};
  border-radius: 1px;
`

const TrailingGroup = styled(motion.div)`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
`

const SearchArea = styled(motion.div)`
  display: flex;
  justify-content: flex-end;
  min-width: 0;
  overflow: hidden;
`

const ManageButtonMotion = styled(motion.div)`
  display: flex;
`
