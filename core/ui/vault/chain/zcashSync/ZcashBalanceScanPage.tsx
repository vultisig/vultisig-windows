import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getZcashZAddress } from '@core/chain/chains/zcash/getZcashZAddress'
import { isLightwalletdTransportAvailable } from '@core/chain/chains/zcash/lightwalletd/grpcWeb'
import { getSaplingProver } from '@core/chain/chains/zcash/saplingProver'
import { getZcashSaplingSpendableBalance } from '@core/chain/chains/zcash/saplingSpending'
import { ensureZcashScanDataSynced } from '@core/chain/chains/zcash/scanner'
import { getZcashScanStorage } from '@core/chain/chains/zcash/zcashScanStorage'
import { getZcashVaultData } from '@core/chain/chains/zcash/zcashVaultData'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { initializeFrozt } from '@core/mpc/frozt/initialize'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { BalanceScanPage } from '@core/ui/vault/chain/balanceScan/BalanceScanPage'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { frozt_keyshare_bundle_birthday } from 'frozt-wasm'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useZcashBalanceScanStatus } from './useZcashBalanceScanStatus'

const warmSaplingProverInBackground = () => {
  void getSaplingProver().catch(error => {
    console.warn('Sapling prover warm-up failed:', error)
  })
}

const getZcashScanSetup = async (
  vaultData: NonNullable<ReturnType<typeof getZcashVaultData>>
) => {
  await initializeFrozt()

  const bundle = Buffer.from(vaultData.bundle, 'base64')
  const pubKeyPackage = Buffer.from(vaultData.pubKeyPackage, 'base64')
  const saplingExtras = Buffer.from(vaultData.saplingExtras, 'base64')
  const birthday = Number(frozt_keyshare_bundle_birthday(bundle))
  const zAddress = await getZcashZAddress(
    vaultData.pubKeyPackage,
    vaultData.saplingExtras
  )

  return {
    birthHeight: birthday > 0 ? birthday : null,
    pubKeyPackage,
    saplingExtras,
    zAddress,
  }
}

export const ZcashBalanceScanPage = () => {
  const { t } = useTranslation()
  const refetchQueries = useRefetchQueries()
  const coins = useCurrentVaultChainCoins(Chain.ZcashSapling)
  const vaultData = getZcashVaultData()
  const hasRefetchedOnSync = useRef(false)

  const {
    error,
    isSyncing,
    loading,
    refresh,
    scanData,
    chainTip,
    syncTarget,
    confirmingNotes,
    confirmationsRemaining,
  } = useZcashBalanceScanStatus({
    publicKeyEcdsa: vaultData?.publicKeyEcdsa,
  })

  useEffect(() => {
    if (!vaultData) return
    if (!isLightwalletdTransportAvailable()) return
    ;(async () => {
      try {
        const { birthHeight, pubKeyPackage, saplingExtras, zAddress } =
          await getZcashScanSetup(vaultData)
        const scanPromise = ensureZcashScanDataSynced({
          zAddress,
          publicKeyEcdsa: vaultData.publicKeyEcdsa,
          pubKeyPackage,
          saplingExtras,
          birthHeight,
        })

        warmSaplingProverInBackground()
        await scanPromise
      } catch (scanError) {
        console.error('Zcash sync failed:', scanError)
      }
    })()
  }, [vaultData])

  useEffect(() => {
    if (isSyncing) {
      hasRefetchedOnSync.current = false
      return
    }
    if (hasRefetchedOnSync.current) return
    hasRefetchedOnSync.current = true

    refetchQueries(...coins.map(extractAccountCoinKey).map(getBalanceQueryKey))
  }, [coins, isSyncing, refetchQueries])

  const resetScan = async () => {
    if (!scanData || !vaultData) return

    await getZcashScanStorage().save({
      ...scanData,
      scanHeight: null,
      scanTarget: null,
      birthdayScanDone: false,
      notes: [],
    })

    try {
      const { birthHeight, pubKeyPackage, saplingExtras, zAddress } =
        await getZcashScanSetup(vaultData)
      const scanPromise = ensureZcashScanDataSynced({
        zAddress,
        publicKeyEcdsa: vaultData.publicKeyEcdsa,
        pubKeyPackage,
        saplingExtras,
        birthHeight,
        force: true,
      })

      warmSaplingProverInBackground()
      await scanPromise
    } catch (scanError) {
      console.error('Zcash forced sync failed:', scanError)
    }

    await refresh()
  }

  const notesFound = scanData?.notes?.length ?? 0
  const spendableBalance = getZcashSaplingSpendableBalance(
    scanData?.notes ?? [],
    scanData?.scanHeight ?? null
  )
  const scannedBalance =
    scanData != null
      ? `${formatAmount(fromChainAmount(spendableBalance, 8), {
          ticker: 'ZEC',
          precision: 'high',
        })}`
      : '— ZEC'
  const isConfirming = confirmingNotes.length > 0
  const metrics = [
    {
      title: t('zcash_notes_found', { defaultValue: 'Notes Found' }),
      extra: <Text>{notesFound.toLocaleString()}</Text>,
    },
    {
      title: t('locked_outputs'),
      extra: isConfirming ? (
        <Text color="idle">
          {confirmingNotes.length} ({confirmationsRemaining}{' '}
          {t('blocks_remaining')})
        </Text>
      ) : (
        <Text>0</Text>
      ),
    },
    {
      title: t('current_scanned_balance'),
      extra: <Text>{scannedBalance}</Text>,
    },
  ]

  return (
    <BalanceScanPage
      error={error}
      loading={loading}
      birthHeight={scanData?.birthHeight ?? null}
      scanHeight={scanData?.scanHeight ?? null}
      syncTarget={syncTarget}
      chainTip={chainTip}
      metrics={metrics}
      onReset={scanData ? resetScan : null}
    />
  )
}
