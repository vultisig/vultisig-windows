import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { StationPenIcon } from '@lib/ui/icons/StationFigmaIcons'
import { hStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { SearchChain } from './controls/SearchChain'

export const VaultTabsHeader = ({ children }: ChildrenProp) => {
  const { client } = useCore()
  const { colors } = useTheme()
  const vault = useCurrentVault()
  const navigate = useCoreNavigate()
  const { t } = useTranslation()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const isExtension = client === 'extension'

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
              {isExtension ? (
                <ManageChainsButton
                  data-testid="manage-chains-button"
                  onClick={() => navigate({ id: 'manageVaultChains' })}
                >
                  <IconWrapper size={16}>
                    <StationPenIcon />
                  </IconWrapper>
                  <Text variant="footnote" color="supporting">
                    {t('chains')}
                  </Text>
                </ManageChainsButton>
              ) : (
                <IconButton
                  data-testid="manage-chains-button"
                  kind="secondary"
                  onClick={() => navigate({ id: 'manageVaultChains' })}
                  style={{ color: colors.info.toCssValue() }}
                  size="lg"
                >
                  <HousePenIcon />
                </IconButton>
              )}
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

const ManageChainsButton = styled(UnstyledButton)`
  ${hStack({ alignItems: 'center', gap: 8 })};
  ${borderRadius.pill};
  height: 40px;
  padding: 12px;
  color: ${getColor('contrast')};
  background: ${getColor('foreground')};
  box-shadow: inset 0 0 8px rgba(240, 244, 252, 0.03);
`
import { HousePenIcon } from '@lib/ui/icons/HousePenIcon'
