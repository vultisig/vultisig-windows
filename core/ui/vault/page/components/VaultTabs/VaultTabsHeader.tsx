import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ManagePillButton } from '@core/ui/vault/components/ManagePillButton'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { SearchChain } from './controls/SearchChain'

export const VaultTabsHeader = ({ children }: ChildrenProp) => {
  const vault = useCurrentVault()
  const navigate = useCoreNavigate()
  const { t } = useTranslation()
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
          {!isSearchExpanded && !isKeyImportVault(vault) && (
            <ManageButtonMotion
              key="manage-vault-chains"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <ManagePillButton
                data-testid="manage-chains-button"
                onClick={() => navigate({ id: 'manageVaultChains' })}
              >
                <IconWrapper size={16}>
                  <PencilIcon />
                </IconWrapper>
                <Text variant="footnote" color="contrast">
                  {t('chains')}
                </Text>
              </ManagePillButton>
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

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      margin-bottom: 12px;
    `}
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

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      gap: 12px;
    `}
`

const SearchArea = styled(motion.div)`
  display: flex;
  justify-content: flex-end;
  min-width: 0;
  overflow: hidden;

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      align-items: center;
    `}
`

const ManageButtonMotion = styled(motion.div)`
  display: flex;
`
