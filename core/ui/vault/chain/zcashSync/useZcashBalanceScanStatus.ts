import { getLatestBlock } from '@core/chain/chains/zcash/lightwalletd/client'
import { isLightwalletdTransportAvailable } from '@core/chain/chains/zcash/lightwalletd/grpcWeb'
import { SaplingNote } from '@core/chain/chains/zcash/SaplingNote'
import {
  getConfirmingZcashNotes,
  getZcashConfirmationsRemaining,
} from '@core/chain/chains/zcash/saplingSpending'
import {
  getZcashScanStorage,
  ZcashScanData,
} from '@core/chain/chains/zcash/zcashScanStorage'
import { useCallback, useEffect, useState } from 'react'

type ZcashBalanceScanStatus = {
  loading: boolean
  error: string | null
  scanData: ZcashScanData | null
  chainTip: number | null
  syncTarget: number | null
  confirmingNotes: SaplingNote[]
  confirmationsRemaining: number
  isSyncing: boolean
}

type UseZcashBalanceScanStatusInput = {
  publicKeyEcdsa?: string
  pollIntervalMs?: number
}

const initialStatus: ZcashBalanceScanStatus = {
  loading: true,
  error: null,
  scanData: null,
  chainTip: null,
  syncTarget: null,
  confirmingNotes: [],
  confirmationsRemaining: 0,
  isSyncing: true,
}

export const useZcashBalanceScanStatus = ({
  publicKeyEcdsa,
  pollIntervalMs = 3000,
}: UseZcashBalanceScanStatusInput) => {
  const [status, setStatus] = useState<ZcashBalanceScanStatus>(initialStatus)

  const refresh = useCallback(async () => {
    if (!publicKeyEcdsa || !isLightwalletdTransportAvailable()) {
      setStatus({
        ...initialStatus,
        loading: false,
        isSyncing: false,
      })
      return
    }

    try {
      const [scanData, latestBlock] = await Promise.all([
        getZcashScanStorage().load(publicKeyEcdsa),
        getLatestBlock().catch(() => null),
      ])

      const chainTip = latestBlock?.height ?? null
      const syncTarget = scanData?.scanTarget ?? chainTip
      const isSyncing =
        !scanData ||
        !scanData.birthdayScanDone ||
        scanData.scanHeight == null ||
        (syncTarget != null && scanData.scanHeight < syncTarget)

      const confirmingNotes = getConfirmingZcashNotes(
        scanData?.notes ?? [],
        chainTip
      )
      const confirmationsRemaining = getZcashConfirmationsRemaining(
        confirmingNotes,
        chainTip
      )

      setStatus({
        loading: false,
        error: null,
        scanData,
        chainTip,
        syncTarget,
        confirmingNotes,
        confirmationsRemaining,
        isSyncing,
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
