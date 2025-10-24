import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { useTranslation } from 'react-i18next'

import { VaultChainItem } from '../VaultChainItem'

export const Portfolio = () => {
  const navigate = useCoreNavigate()
  const { data: vaultChainBalances = [] } = useVaultChainsBalancesQuery()
  const { t } = useTranslation()

  return (
    <VStack gap={16}>
      {vaultChainBalances.map(balance => (
        <VaultChainItem key={balance.chain} balance={balance} />
      ))}
      <ListAddButton onClick={() => navigate({ id: 'manageVaultChains' })}>
        {t('choose_chains')}
      </ListAddButton>
    </VStack>
  )
}
