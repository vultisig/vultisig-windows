import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useEffect } from 'react'

type DeriveAddressRequestEvent = {
  requestId: string
  vaultPubKey: string
  chain: string
}

export const AgentChainBridge = () => {
  const vault = useCurrentVault()
  const currentVaultPubKey = getVaultId(vault)
  const walletCore = useAssertWalletCore()
  const { createCoin } = useCore()
  const invalidate = useInvalidateQueries()

  useEffect(() => {
    if (!window.runtime) return

    const onDeriveAddressRequest = async (data: DeriveAddressRequestEvent) => {
      const agentService = window.go?.agent?.AgentService
      if (!agentService || !('ProvideChainAddress' in agentService)) {
        return
      }

      try {
        if (data.vaultPubKey !== currentVaultPubKey) {
          await agentService.ProvideChainAddress(
            data.requestId,
            '',
            '',
            'chain derive request vault does not match current vault'
          )
          return
        }

        const chainValues = Object.values(Chain)
        if (!isOneOf(data.chain, chainValues)) {
          await agentService.ProvideChainAddress(
            data.requestId,
            '',
            '',
            `unsupported chain: ${data.chain}`
          )
          return
        }

        const chain = data.chain as Chain
        const feeCoin = chainFeeCoin[chain]

        const publicKey = getPublicKey({
          chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
          chainPublicKeys: vault.chainPublicKeys,
        })

        const address = deriveAddress({
          chain,
          publicKey,
          walletCore,
        })

        const vaultId = currentVaultPubKey

        await createCoin({
          vaultId,
          coin: {
            chain,
            address,
            ticker: feeCoin.ticker,
            decimals: feeCoin.decimals,
            logo: feeCoin.logo,
            priceProviderId: feeCoin.priceProviderId,
          },
        })

        await invalidate([StorageKey.vaultsCoins])

        await agentService.ProvideChainAddress(
          data.requestId,
          data.chain,
          address,
          ''
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        await agentService.ProvideChainAddress(data.requestId, '', '', message)
      }
    }

    return window.runtime.EventsOn(
      'agent:chain:derive_address',
      onDeriveAddressRequest as (data: unknown) => void
    )
  }, [currentVaultPubKey, walletCore, vault, createCoin, invalidate])

  return null
}
