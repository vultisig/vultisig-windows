import { hasServer } from '@core/mpc/devices/localPartyId'
import { getVaultId } from '@core/mpc/vault/Vault'
import { FastVaultPasswordVerification } from '@core/ui/mpc/fast/FastVaultPasswordVerification'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { VStack } from '@lib/ui/layout/Stack'
import { ReactNode, useRef } from 'react'
import styled from 'styled-components'

import {
  BottomNavigation,
  bottomNavigationHeight,
} from '../../components/BottomNavigation'
import { VaultOverview } from './VaultOverview'
import { VaultPageHeader } from './VaultPageHeader'

type VaultPageProps = {
  primaryControls?: ReactNode
}

export const VaultPage = ({ primaryControls }: VaultPageProps = {}) => {
  const vault = useCurrentVault()
  const { signers } = vault
  const isFastVault = hasServer(signers)
  const vaultId = getVaultId(vault)
  const scrollContainerRef = useRef<HTMLDivElement>(null!)

  return (
    <Wrapper justifyContent="space-between" flexGrow>
      <VStack flexGrow>
        <VaultPageHeader
          vault={vault}
          scrollContainerRef={scrollContainerRef}
          primaryControls={primaryControls}
        />
        <VaultOverview scrollContainerRef={scrollContainerRef} />
        {isFastVault && <FastVaultPasswordVerification key={vaultId} />}
      </VStack>
      <BottomNavigation />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  margin-bottom: ${bottomNavigationHeight}px;
`
