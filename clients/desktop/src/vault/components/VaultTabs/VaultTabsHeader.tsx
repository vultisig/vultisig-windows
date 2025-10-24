import { IconButton } from '@lib/ui/buttons/IconButton'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import styled from 'styled-components'

export const VaultTabsHeader = ({ children }: ChildrenProp) => {
  return (
    <Wrapper>
      <TabsHeaderContainer>{children}</TabsHeaderContainer>
      <HStack gap={8} alignItems="center">
        <IconButton>
          <SearchIcon />
        </IconButton>
        <IconButton>
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
