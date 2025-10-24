import {
  FooterActions,
  footerActionsHeight,
} from '@clients/desktop/src/vault/components/FooterActions'
import { VaultOverview } from '@clients/desktop/src/vault/components/VaultOverview'
import { hasServer } from '@core/mpc/devices/localPartyId'
import { FastVaultPasswordVerification } from '@core/ui/mpc/fast/FastVaultPasswordVerification'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { VStack } from '@lib/ui/layout/Stack'
import { useRef } from 'react'
import styled from 'styled-components'

import { UpdatePrompt } from '../../versioning/UpdatePrompt'
import { VaultPageHeader } from './VaultPageHeader'

export const VaultPage = () => {
  const vault = useCurrentVault()
  const { signers } = vault
  const isFastVault = hasServer(signers)
  const vaultId = getVaultId(vault)
  const scrollContainerRef = useRef<HTMLDivElement>(null!)

  return (
    <Wrapper justifyContent="space-between" ref={scrollContainerRef} flexGrow>
      <VStack flexGrow>
        <VaultPageHeader
          vault={vault}
          scrollContainerRef={scrollContainerRef}
        />
        <VaultOverview />
        <UpdatePrompt />
        {isFastVault && <FastVaultPasswordVerification key={vaultId} />}
      </VStack>
      <FooterActions />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  overflow-y: auto;
  margin-bottom: ${footerActionsHeight}px;
`
