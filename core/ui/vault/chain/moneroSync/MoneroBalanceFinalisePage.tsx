import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import {
  createMoneroBalanceFinaliseMessage,
  formatMoneroAtomicAmount,
  moneroBalanceFinaliseMethod,
} from '@core/chain/chains/monero/balanceFinaliseMessage'
import { getMoneroScanStorage } from '@core/chain/chains/monero/moneroScanStorage'
import {
  encodeMoneroOutputsWithAmounts,
  ensureMoneroScanDataSynced,
} from '@core/chain/chains/monero/scanner'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { getVaultId } from '@core/mpc/vault/Vault'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { BalanceScanPage } from '@core/ui/vault/chain/balanceScan/BalanceScanPage'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Text } from '@lib/ui/text'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useMoneroBalanceScanStatus } from './useMoneroBalanceScanStatus'

export const MoneroBalanceFinalisePage = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const keyShareBase64 = vault.chainKeyShares?.[Chain.Monero]
  const publicKeyEcdsa = vault.publicKeys.ecdsa

  const {
    error,
    loading,
    pendingOutputs,
    confirmingOutputs,
    confirmationsRemaining,
    refresh,
    requiresFinalise,
    scanData,
    syncTarget,
  } = useMoneroBalanceScanStatus({
    publicKeyEcdsa,
  })

  useEffect(() => {
    if (!keyShareBase64) return

    ensureMoneroScanDataSynced({
      keyShareBase64,
      publicKeyEcdsa,
    }).catch(scanError => {
      console.error('[MoneroBalanceFinalisePage] sync failed:', scanError)
    })
  }, [keyShareBase64, publicKeyEcdsa])

  const isConfirming = confirmingOutputs.length > 0

  const keysignPayload = useMemo(() => {
    if (!scanData || pendingOutputs.length === 0) {
      return null
    }

    const outputsData = encodeMoneroOutputsWithAmounts(pendingOutputs)
    const message = createMoneroBalanceFinaliseMessage({
      publicKeyEcdsa,
      outputs: pendingOutputs,
      outputsData,
      balanceAtomic: scanData.balance,
      scanHeight: scanData.scanHeight,
      chainTip: syncTarget,
    })

    return {
      custom: create(CustomMessagePayloadSchema, {
        method: moneroBalanceFinaliseMethod,
        message: JSON.stringify(message),
        vaultPublicKeyEcdsa: getVaultId(vault),
        vaultLocalPartyId: vault.localPartyId,
        chain: Chain.Monero,
      }),
    }
  }, [pendingOutputs, publicKeyEcdsa, scanData, syncTarget, vault])

  const resetScan = useCallback(async () => {
    if (!scanData || !keyShareBase64) return

    await getMoneroScanStorage().save({
      ...scanData,
      scanHeight: null,
      scanTarget: null,
      birthdayScanDone: false,
      balance: '0',
      totalOutputs: 0,
      spentOutputs: 0,
      spendDetectionMode: 'key-image+local',
      walletKeysData: undefined,
      walletCacheData: undefined,
      outputs: [],
    })

    await ensureMoneroScanDataSynced({
      keyShareBase64,
      publicKeyEcdsa,
      force: true,
    }).catch(scanError => {
      console.error(
        '[MoneroBalanceFinalisePage] forced sync failed:',
        scanError
      )
    })

    await refresh()
  }, [keyShareBase64, publicKeyEcdsa, refresh, scanData])

  const totalOutputs = scanData?.totalOutputs ?? scanData?.outputs?.length ?? 0
  const unknownOutputs = pendingOutputs.length
  const spentOutputs = scanData?.spentOutputs ?? 0
  const unspentOutputs = Math.max(
    0,
    totalOutputs - spentOutputs - unknownOutputs
  )
  const metrics = [
    {
      title: t('total_outputs'),
      extra: <Text>{totalOutputs.toLocaleString()}</Text>,
    },
    {
      title: t('current_scanned_balance'),
      extra: (
        <Text>
          {scanData != null ? formatMoneroAtomicAmount(scanData.balance) : '— XMR'}
        </Text>
      ),
    },
    {
      title: t('unspent_outputs'),
      extra: <Text>{unspentOutputs.toLocaleString()}</Text>,
    },
    {
      title: t('locked_outputs'),
      extra: isConfirming ? (
        <Text color="idle">
          {confirmingOutputs.length} ({confirmationsRemaining}{' '}
          {t('blocks_remaining')})
        </Text>
      ) : (
        <Text>0</Text>
      ),
    },
    {
      title: t('unknown_outputs'),
      extra: <Text>{unknownOutputs.toLocaleString()}</Text>,
    },
  ]

  return (
    <>
      <BalanceScanPage
        error={error}
        loading={loading}
        birthHeight={scanData?.birthHeight ?? null}
        scanHeight={scanData?.scanHeight ?? null}
        syncTarget={syncTarget}
        metrics={metrics}
        onReset={scanData ? resetScan : null}
        footer={
          requiresFinalise ? (
            <StartKeysignPrompt
              keysignPayload={keysignPayload ?? undefined}
              disabledMessage={t('monero_balance_scan_not_ready')}
              fastLabel={t('fast_reveal')}
              secureLabel={t('paired_reveal')}
              holdLabel={t('hold_for_paired_reveal')}
            />
          ) : null
        }
      />
    </>
  )
}
