import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Wrap } from '@lib/ui/base/Wrap'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { PageContent } from '@lib/ui/page/PageContent'
import { areEmptyChildren } from '@lib/ui/utils/areEmptyChildren'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import VaultBackupBanner from '../../components/vaultBackupBanner/VaultBackupBanner/VaultBackupBanner'
import { VaultTotalBalance } from '../balance/VaultTotalBalance'
import { MigrateVaultPrompt } from '../keygen/migrate/MigrateVaultPrompt'
import { VaultChainItem } from './VaultChainItem'

const PromptsContainer = styled.div`
  padding-inline: 20px;
  margin-top: 12px;
  ${vStack({ gap: 20 })}
`

export const VaultOverview = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { data: vaultChainBalances = [] } = useVaultChainsBalancesQuery()
  const { isBackedUp, libType } = useCurrentVault()

  return (
    <VStack fullHeight>
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
      <PageContent gap={32} flexGrow>
        <VStack alignItems="center" gap={24}>
          <VaultTotalBalance />
          <VaultPrimaryActions />
        </VStack>
        <VStack gap={16}>
          {vaultChainBalances.map(balance => (
            <VaultChainItem key={balance.chain} balance={balance} />
          ))}
          <ListAddButton onClick={() => navigate({ id: 'manageVaultChains' })}>
            {t('choose_chains')}
          </ListAddButton>
        </VStack>
      </PageContent>
    </VStack>
  )
}
