import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { extractCoinKey } from '@core/chain/coin/Coin'
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
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ValueProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { SendDeeplinkData } from '../core'

export const ProcessSend = ({ value }: ValueProp<SendDeeplinkData>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vaults = useVaults()
  const currentVaultId = useCurrentVaultId()
  const { mutate: setCurrentVaultId } = useSetCurrentVaultIdMutation()

  const vaultsWithCoin = useMemo(() => {
    return vaults.filter(({ coins }) =>
      coins.some(
        coin => coin.chain === value.chain && coin.ticker === value.ticker
      )
    )
  }, [vaults, value.chain, value.ticker])

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
          {vaultsWithCoin.map(vault => {
            const vaultId = getVaultId(vault)

            return (
              <VaultListItem
                key={vaultId}
                vault={vault}
                onSelect={() => {
                  const coin = shouldBePresent(
                    vault.coins.find(
                      coin =>
                        coin.chain === value.chain &&
                        coin.ticker === value.ticker
                    )
                  )
                  setCurrentVaultId(vaultId, {
                    onSuccess: () => {
                      navigate({
                        id: 'send',
                        state: {
                          coin: extractCoinKey(coin),
                          address: value.toAddress,
                          amount: value.amount
                            ? toChainAmount(Number(value.amount), coin.decimals)
                            : undefined,
                          memo: value.memo,
                        },
                      })
                    },
                  })
                }}
                selected={vaultId === currentVaultId}
              />
            )
          })}
        </VStack>
      </PageContent>
    </>
  )
}
