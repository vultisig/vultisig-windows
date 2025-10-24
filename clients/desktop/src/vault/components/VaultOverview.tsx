import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Wrap } from '@lib/ui/base/Wrap'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ChildrenProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { areEmptyChildren } from '@lib/ui/utils/areEmptyChildren'
import styled from 'styled-components'

import VaultBackupBanner from '../../components/vaultBackupBanner/VaultBackupBanner/VaultBackupBanner'
import { VaultTotalBalance } from '../balance/VaultTotalBalance'
import { MigrateVaultPrompt } from '../keygen/migrate/MigrateVaultPrompt'
import { VaultOverviewPrimaryActions } from './VaultOverviewPrimaryActions'
import { VaultTabs } from './VaultTabs/VaultTabs'

const PromptsContainer = styled.div`
  padding-inline: 20px;
  margin-top: 12px;
  ${vStack({ gap: 20 })};
`

const PromptsWrapper = ({ children }: ChildrenProp) => {
  return areEmptyChildren(children) ? null : (
    <PromptsContainer>{children}</PromptsContainer>
  )
}

export const VaultOverview = () => {
  const { isBackedUp, libType } = useCurrentVault()

  return (
    <VStack fullHeight>
      <Wrap wrap={PromptsWrapper}>{!isBackedUp && <VaultBackupBanner />}</Wrap>
      <PageContent scrollable gap={32} flexGrow>
        <VStack alignItems="center" gap={24}>
          <VaultTotalBalance />
          <VaultOverviewPrimaryActions />
          {libType !== 'DKLS' && <MigrateVaultPrompt />}
        </VStack>
        <Divider />
        <VaultTabs />
      </PageContent>
    </VStack>
  )
}

const Divider = styled.div`
  height: 1px;
  align-self: stretch;
  background: ${getColor('foregroundExtra')};
`
