import { getMoneroChainTip } from '@core/chain/chains/monero/chainTip'
import {
  getMoneroScanStorage,
  MoneroScanData,
  MoneroStoredOutput,
} from '@core/chain/chains/monero/moneroScanStorage'
import { getPendingMoneroKeyImageOutputs } from '@core/chain/chains/monero/scanner'
import {
  getConfirmingMoneroOutputs,
  getMoneroConfirmationsRemaining,
} from '@core/chain/chains/monero/spending'
import { useCallback, useEffect, useState } from 'react'

type MoneroBalanceScanStatus = {
  loading: boolean
  error: string | null
  scanData: MoneroScanData | null
  chainTip: number | null
  syncTarget: number | null
  pendingOutputs: MoneroStoredOutput[]
  confirmingOutputs: MoneroStoredOutput[]
  confirmationsRemaining: number
  isSyncing: boolean
  requiresFinalise: boolean
}

type UseMoneroBalanceScanStatusInput = {
  publicKeyEcdsa?: string
  pollIntervalMs?: number
}

const initialStatus: MoneroBalanceScanStatus = {
  loading: true,
  error: null,
  scanData: null,
  chainTip: null,
  syncTarget: null,
  pendingOutputs: [],
  confirmingOutputs: [],
  confirmationsRemaining: 0,
  isSyncing: true,
  requiresFinalise: false,
}

export const useMoneroBalanceScanStatus = ({
  publicKeyEcdsa,
  pollIntervalMs = 3000,
}: UseMoneroBalanceScanStatusInput) => {
  const [status, setStatus] = useState<MoneroBalanceScanStatus>(initialStatus)

  const refresh = useCallback(async () => {
    if (!publicKeyEcdsa) {
      setStatus({
        ...initialStatus,
        loading: false,
      })
      return
    }

    try {
      const [scanData, chainTip] = await Promise.all([
        getMoneroScanStorage().load(publicKeyEcdsa),
        getMoneroChainTip().catch(() => null),
      ])

      const syncTarget = scanData?.scanTarget ?? chainTip
      const pendingOutputs = getPendingMoneroKeyImageOutputs(
        scanData?.outputs ?? []
      )
      const isSyncing =
        !scanData ||
        !scanData.birthdayScanDone ||
        scanData.scanHeight == null ||
        (syncTarget != null && scanData.scanHeight < syncTarget)

      const allOutputs = scanData?.outputs ?? []
      const confirmingOutputs = getConfirmingMoneroOutputs(allOutputs, chainTip)
      const confirmationsRemaining = getMoneroConfirmationsRemaining(
        confirmingOutputs,
        chainTip
      )
      setStatus({
        loading: false,
        error: null,
        scanData,
        chainTip,
        syncTarget,
        pendingOutputs,
        confirmingOutputs,
        confirmationsRemaining,
        isSyncing,
        requiresFinalise: !isSyncing && pendingOutputs.length > 0,
      })
    } catch (error) {
      setStatus(current => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      }))
    }
  }, [publicKeyEcdsa])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (cancelled) return
      await refresh()
    }

    void run()
    const intervalId = setInterval(run, pollIntervalMs)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [pollIntervalMs, refresh])

  return {
    ...status,
    refresh,
  }
}
