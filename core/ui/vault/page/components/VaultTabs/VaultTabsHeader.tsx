import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import styled, { useTheme } from 'styled-components'

import { SearchChain } from './controls/SearchChain'

export const VaultTabsHeader = ({ children }: ChildrenProp) => {
  const { colors } = useTheme()
  const navigate = useCoreNavigate()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  return (
    <Wrapper>
      <AnimatePresence initial={false}>
        {!isSearchExpanded && (
          <TabsHeaderMotion
            key="vault-tabs"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {children}
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
              key="manage-vault-chains"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <IconButton
                kind="secondary"
                onClick={() => navigate({ id: 'manageVaultChains' })}
                style={{
                  color: colors.info.toCssValue(),
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

  margin-bottom: 16px;
`

const TabsHeaderContainer = styled.div`
  ${hStack({
    gap: 12,
    alignItems: 'center',
  })};
`

const TabsHeaderMotion = motion(TabsHeaderContainer)

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
