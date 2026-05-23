import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { QbtcClaimBanner } from '@core/ui/qbtc/claim/components/QbtcClaimBanner'
import { QbtcClaimSection } from '@core/ui/qbtc/claim/components/QbtcClaimSection'
import { useCore } from '@core/ui/state/core'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { ArCubeIcon } from '@lib/ui/icons/ArCubeIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { pageBottomInsetVar, PageContent } from '@lib/ui/page/PageContent'
import { Chain } from '@vultisig/core-chain/Chain'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import styled from 'styled-components'

import { useCurrentVaultAddress } from '../state/currentVaultCoins'
import { RefreshVaultChainBalance } from './RefreshVaultChainBalance'
import { VaultChainTabs } from './tabs/VaultChainTabs'
import { TronResourcesSection } from './tron/TronResourcesSection'
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
            <HStack gap={4} alignItems="center">
              <RefreshVaultChainBalance />
              <IconButton onClick={() => openUrl(blockExplorerUrl)}>
                <IconWrapper size={24}>
                  <ArCubeIcon />
                </IconWrapper>
              </IconButton>
            </HStack>
          }
        />
        <StyledPageContent scrollable gap={32} flexGrow>
          <VaultChainOverview />
          {chain === Chain.Tron && <TronResourcesSection />}
          <VaultChainTabs />
          {chain === Chain.Bitcoin && <QbtcClaimBanner />}
        </StyledPageContent>
        {chain === Chain.QBTC && (
          <BottomCtaArea>
            <QbtcClaimSection />
          </BottomCtaArea>
        )}
      </VStack>
      <BottomNavigation isActiveTabRoot={false} />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
`

const StyledPageContent = styled(PageContent)`
  ${hideScrollbars};
`

const BottomCtaArea = styled.div`
  flex-shrink: 0;
  padding: 16px;
  padding-bottom: calc(16px + var(${pageBottomInsetVar}, 0px));
  @supports (padding-bottom: calc(0px + env(safe-area-inset-bottom))) {
    padding-bottom: calc(
      16px + var(${pageBottomInsetVar}, 0px) + env(safe-area-inset-bottom)
    );
  }
`
