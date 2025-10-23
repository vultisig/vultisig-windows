import {
  FooterActions,
  UploadQrPrompt,
} from '@clients/desktop/src/vault/components/UploadQrPrompt'
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
    <>
      <Wrapper ref={scrollContainerRef} flexGrow>
        <VaultPageHeader
          vault={vault}
          scrollContainerRef={scrollContainerRef}
        />
        <VaultOverview />
      </Wrapper>
      <UpdatePrompt />
      {isFastVault && <FastVaultPasswordVerification key={vaultId} />}
      <FooterActions />
    </>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  overflow-y: auto;
`
