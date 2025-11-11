import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCore } from '@core/ui/state/core'
import {
  BottomNavigation,
  bottomNavigationHeight,
} from '@core/ui/vault/components/BottomNavigation'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { ArCubeIcon } from '@lib/ui/icons/ArCubeIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import styled from 'styled-components'

import { useCurrentVaultAddress } from '../state/currentVaultCoins'
import { VaultChainTabs } from './tabs/VaultChainTabs'
import { useCurrentVaultChain } from './useCurrentVaultChain'
import { VaultChainOverview } from './VaultChainOverview'

export const VaultChainPage = () => {
  const { openUrl } = useCore()
  const chain = useCurrentVaultChain()
  const address = useCurrentVaultAddress(chain)

  const blockExplorerUrl = getBlockExplorerUrl({
    chain,
    entity: 'address',
    value: address,
  })

  return (
    <Wrapper
      data-testid="VaultChainPage-Wrapper"
      justifyContent="space-between"
      flexGrow
    >
      <VStack flexGrow>
        <VaultHeader
          primaryControls={<PageHeaderBackButton />}
          secondaryControls={
            <IconButton onClick={() => openUrl(blockExplorerUrl)}>
              <IconWrapper size={24}>
                <ArCubeIcon />
              </IconWrapper>
            </IconButton>
          }
        />
        <StyledPageContent scrollable gap={32} flexGrow>
          <VaultChainOverview />
          <VaultChainTabs />
        </StyledPageContent>
      </VStack>
      <BottomNavigation />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  margin-bottom: ${bottomNavigationHeight}px;
`

const StyledPageContent = styled(PageContent)`
  ${hideScrollbars};
`
