import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import styled, { useTheme } from 'styled-components'

export const VaultTabsHeader = ({ children }: ChildrenProp) => {
  const { colors } = useTheme()
  const navigate = useCoreNavigate()

  return (
    <Wrapper>
      <TabsHeaderContainer>{children}</TabsHeaderContainer>
      <HStack gap={8} alignItems="center">
        <IconButton size="lg">
          <SearchIcon />
        </IconButton>
        <IconButton
          onClick={() => navigate({ id: 'manageVaultChains' })}
          style={{
            color: colors.buttonPrimary.toCssValue(),
          }}
          size="lg"
        >
          <CryptoWalletPenIcon />
        </IconButton>
      </HStack>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })};

  margin-bottom: 16px;
`

const TabsHeaderContainer = styled.div`
  ${hStack({
    gap: 12,
    alignItems: 'center',
  })};
`
