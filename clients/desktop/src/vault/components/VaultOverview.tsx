import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Wrap } from '@lib/ui/base/Wrap'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { areEmptyChildren } from '@lib/ui/utils/areEmptyChildren'
import styled from 'styled-components'

import VaultBackupBanner from '../../components/vaultBackupBanner/VaultBackupBanner/VaultBackupBanner'
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller'
import { VaultTotalBalance } from '../balance/VaultTotalBalance'
import { ManageVaultChainsPrompt } from '../chain/manage/ManageVaultChainsPrompt'
import { MigrateVaultPrompt } from '../keygen/migrate/MigrateVaultPrompt'
import { useVaultChainsBalancesQuery } from '../queries/useVaultChainsBalancesQuery'
import { VaultChainItem } from './VaultChainItem'
import { VaultPrimaryActions } from './VaultPrimaryActions'

const PromptsContainer = styled.div`
  padding-inline: 20px;
  margin-top: 12px;
  ${vStack({ gap: 20 })}
`

export const VaultOverview = () => {
  const { data: vaultChainBalances = [] } = useVaultChainsBalancesQuery()
  const { isBackedUp, libType } = useCurrentVault()

  return (
    <ScrollableFlexboxFiller>
      <Wrap
        wrap={children =>
          areEmptyChildren(children) ? null : (
            <PromptsContainer>{children}</PromptsContainer>
          )
        }
      >
        {!isBackedUp && <VaultBackupBanner />}
        {libType !== 'DKLS' && <MigrateVaultPrompt />}
      </Wrap>
      <PageContent>
        <VStack gap={32}>
          <VStack gap={24} alignItems="center">
            <VaultTotalBalance />
            <VaultPrimaryActions />
          </VStack>
          <VStack gap={16}>
            {vaultChainBalances.map(balance => (
              <VaultChainItem key={balance.chain} balance={balance} />
            ))}
            <ManageVaultChainsPrompt />
          </VStack>
        </VStack>
      </PageContent>
    </ScrollableFlexboxFiller>
  )
}
