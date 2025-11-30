import { CoinKey } from '@core/chain/coin/Coin'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import { getVaultId } from '@core/mpc/vault/Vault'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useCurrentVaultId,
  useSetCurrentVaultIdMutation,
} from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultListItem } from '@core/ui/vaultsOrganisation/components/VaultListItem'
import { useVaultsTotalBalances } from '@core/ui/vaultsOrganisation/hooks/useVaultsTotalBalances'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ValueProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { SendDeeplinkData } from '../core'

export const ProcessSend = ({ value }: ValueProp<SendDeeplinkData>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vaults = useVaults()
  const currentVaultId = useCurrentVaultId()
  const { mutate: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const { totals: vaultTotals, isPending: isTotalsPending } =
    useVaultsTotalBalances()

  const vaultsWithCoin = useMemo(() => {
    return vaults
      .map(vault => {
        const coin = findByTicker({
          coins: vault.coins,
          ticker: value.ticker,
        })

        if (!coin || coin.chain !== value.chain) {
          return null
        }

        return { vault, coin }
      })
      .filter(
        (
          item
        ): item is {
          vault: (typeof vaults)[0]
          coin: (typeof vaults)[0]['coins'][0]
        } => item !== null
      )
  }, [vaults, value.chain, value.ticker])

  const handleSelectVault = (vaultId: string) => {
    const vaultWithCoin = vaultsWithCoin.find(
      item => getVaultId(item.vault) === vaultId
    )

    if (!vaultWithCoin) {
      return
    }

    const coinKey: CoinKey = {
      chain: vaultWithCoin.coin.chain,
      id: vaultWithCoin.coin.id,
    }

    setCurrentVaultId(vaultId, {
      onSuccess: () => {
        navigate({
          id: 'send',
          state: {
            coin: coinKey,
            address: value.toAddress,
            amount: value.amount,
            memo: value.memo,
          },
        })
      },
    })
  }

  if (vaults.length === 0) {
    return (
      <>
        <FlowPageHeader title={t('send')} />
        <FlowErrorPageContent
          title={t('no_vaults')}
          error={t('create_new_vault')}
        />
      </>
    )
  }

  if (vaultsWithCoin.length === 0) {
    return (
      <>
        <FlowPageHeader title={t('send')} />
        <FlowErrorPageContent
          title={t('coin_not_found_in_current_vault')}
          error={`${value.ticker} on ${value.chain} not found in any vault`}
        />
      </>
    )
  }

  return (
    <>
      <FlowPageHeader title={t('select_vault')} />
      <PageContent gap={16} scrollable>
        <VStack gap={12}>
          {vaultsWithCoin.map(({ vault }) => {
            const vaultId = getVaultId(vault)
            const balance =
              !isTotalsPending && vaultTotals?.[vaultId] !== undefined
                ? vaultTotals[vaultId]
                : undefined

            return (
              <VaultListItem
                key={vaultId}
                vault={vault}
                onSelect={() => handleSelectVault(vaultId)}
                selected={vaultId === currentVaultId}
                balance={balance}
              />
            )
          })}
        </VStack>
      </PageContent>
    </>
  )
}
