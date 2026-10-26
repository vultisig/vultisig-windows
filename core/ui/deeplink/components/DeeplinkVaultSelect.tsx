import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useSetCurrentVaultIdMutation } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultListItem } from '@core/ui/vaultsOrganisation/components/VaultListItem'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'

type DeeplinkVaultSelectProps = {
  title: string
  chain: Chain
  ticker: string
  onSelect: (coin: AccountCoin) => void
}

/**
 * Lets the user pick which vault a deeplink acts on, among the vaults that
 * hold the coin it names, and makes that vault current before handing back
 * the coin.
 */
export const DeeplinkVaultSelect = ({
  title,
  chain,
  ticker,
  onSelect,
}: DeeplinkVaultSelectProps) => {
  const { t } = useTranslation()
  const vaults = useVaults()
  const { mutate: setCurrentVaultId } = useSetCurrentVaultIdMutation()

  const vaultsWithCoin = vaults.filter(({ coins }) =>
    coins.some(coin => coin.chain === chain && coin.ticker === ticker)
  )

  if (vaults.length === 0) {
    return (
      <>
        <FlowPageHeader title={title} />
        <FlowErrorPageContent
          title={t('no_vaults')}
          description={t('create_new_vault')}
        />
      </>
    )
  }

  if (vaultsWithCoin.length === 0) {
    return (
      <>
        <FlowPageHeader title={title} />
        <FlowErrorPageContent
          title={t('coin_not_found_in_current_vault')}
          description={t('coin_not_found_in_any_vault', {
            ticker,
            chain: getChainDisplayName(chain),
          })}
        />
      </>
    )
  }

  return (
    <>
      <FlowPageHeader title={t('select_vault')} />
      <PageContent gap={16} scrollable>
        <VStack gap={12}>
          {vaultsWithCoin.map(vault => {
            const vaultId = getVaultId(vault)

            return (
              <VaultListItem
                key={vaultId}
                vault={vault}
                onSelect={() => {
                  const coin = shouldBePresent(
                    vault.coins.find(
                      coin => coin.chain === chain && coin.ticker === ticker
                    )
                  )
                  setCurrentVaultId(vaultId, {
                    onSuccess: () => onSelect(coin),
                  })
                }}
              />
            )
          })}
        </VStack>
      </PageContent>
    </>
  )
}
