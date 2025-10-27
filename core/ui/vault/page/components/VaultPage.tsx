import { hasServer } from '@core/mpc/devices/localPartyId'
import { getVaultId } from '@core/mpc/vault/Vault'
import { FastVaultPasswordVerification } from '@core/ui/mpc/fast/FastVaultPasswordVerification'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { VStack } from '@lib/ui/layout/Stack'
import { useRef } from 'react'
import styled from 'styled-components'

import { FooterActions, footerActionsHeight } from './FooterActions'
import { VaultOverview } from './VaultOverview'
import { VaultPageHeader } from './VaultPageHeader'

export const VaultPage = () => {
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
        />
        <VaultOverview scrollContainerRef={scrollContainerRef} />
        {isFastVault && <FastVaultPasswordVerification key={vaultId} />}
      </VStack>
      <FooterActions />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  margin-bottom: ${footerActionsHeight}px;
`
