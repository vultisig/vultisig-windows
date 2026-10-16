import { FastVaultPasswordVerification } from '@core/ui/mpc/fast/FastVaultPasswordVerification'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { VStack } from '@lib/ui/layout/Stack'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { ReactNode, useState } from 'react'
import styled from 'styled-components'

import { BottomNavigation } from '../../components/BottomNavigation'
import { HomeHeader } from '../../home/HomeHeader'
import { createHomeMotion, HomeMotionProvider } from '../../home/homeMotion'
import { HomePager } from '../../home/HomePager'
import { homeTabs, useHomeTab } from '../../home/homeTab'

type VaultPageProps = {
  primaryControls?: ReactNode
}

/** Serves both `vault` and `defi` routes; the route picks the tab so deep links and back land on it. */
export const VaultPage = ({ primaryControls }: VaultPageProps = {}) => {
  const vault = useCurrentVault()
  const isFastVault = hasServer(vault.signers)
  const vaultId = getVaultId(vault)
  const tab = useHomeTab()
  const [homeMotion] = useState(() => createHomeMotion(homeTabs.indexOf(tab)))

  return (
    <HomeMotionProvider value={homeMotion}>
      <Wrapper flexGrow data-testid="home-page">
        <HomeHeader primaryControls={primaryControls} />
        <HomePager tab={tab} />
        {isFastVault && <FastVaultPasswordVerification key={vaultId} />}
      </Wrapper>
      <BottomNavigation activeTab={tab} indicator={homeMotion.position} />
    </HomeMotionProvider>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  min-height: 0;
`
