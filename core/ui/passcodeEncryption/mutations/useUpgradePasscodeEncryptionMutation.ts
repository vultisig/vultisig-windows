import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { withPasscodeOperationLock } from '../core/passcodeAttemptThrottle'
import { needsPasscodeSampleRewrite } from '../core/passcodeLock'
import { encryptSample } from '../core/sample'
import {
  decryptVaultAllKeyShares,
  encryptVaultAllKeyShares,
  mapVaultsKeyShares,
  vaultKeySharesNeedPasscodeUpgrade,
} from '../core/vaultKeyShares'
import { usePasscode } from '../state/passcode'

/**
 * Reconciles passcode-protected data with the passcode currently in hand:
 * re-encrypts anything still using the legacy `SHA-256(passcode)` KDF with the
 * strong PBKDF2 cipher, and writes a passcode sample when none is stored beside
 * sealed shares. Runs once after unlock; records already in order are skipped,
 * so it is a no-op when there is nothing to reconcile.
 */
export const useUpgradePasscodeEncryptionMutation = () => {
  const {
    updateVaultsKeyShares,
    setPasscodeEncryption,
    getPasscodeEncryption,
    getVaults,
  } = useCore()
  const refetchQueries = useRefetchQueries()
  const [passcode] = usePasscode()

  // Latest active passcode, so a concurrent change/disable (which captures and
  // rewrites under a different key) makes this background upgrade abort before
  // it overwrites records with stale-key blobs.
  const livePasscodeRef = useRef(passcode)
  livePasscodeRef.current = passcode

  const readSampleRewriteNeed = async (key: string) => {
    const [storedPasscodeEncryption, storedVaults] = await Promise.all([
      getPasscodeEncryption(),
      getVaults(),
    ])

    return needsPasscodeSampleRewrite({
      vaults: storedVaults,
      encryptedSample: storedPasscodeEncryption?.encryptedSample ?? null,
      passcode: key,
    })
  }

  return useMutation({
    mutationFn: async () =>
      withPasscodeOperationLock(async () => {
        const key = shouldBePresent(passcode, 'passcode')

        const isPasscodeStale = () => livePasscodeRef.current !== key

        const vaults = await getVaults()
        const legacyVaults = vaults.filter(vaultKeySharesNeedPasscodeUpgrade)

        if (legacyVaults.length > 0) {
          const vaultsKeyShares = await mapVaultsKeyShares({
            vaults: legacyVaults,
            transform: async vault => {
              const decrypted = await decryptVaultAllKeyShares({
                key,
                keyShares: vault.keyShares,
                chainKeyShares: vault.chainKeyShares,
                keyShareMldsa: vault.keyShareMldsa,
              })
              return encryptVaultAllKeyShares({ ...decrypted, key })
            },
          })

          if (isPasscodeStale()) return

          // The ref above only moves once a concurrent change-passcode reaches
          // its own `setPasscode`, which is after it has already rewritten every
          // vault — so it is not enough on its own. Re-read what is stored and
          // keep only the records that still want this re-wrap; anything another
          // flow has since rewritten is left alone.
          const storedVaults = await getVaults()
          const stillLegacy = Object.fromEntries(
            Object.entries(vaultsKeyShares).filter(([vaultId]) => {
              const stored = storedVaults.find(v => getVaultId(v) === vaultId)

              return (
                stored !== undefined &&
                vaultKeySharesNeedPasscodeUpgrade(stored)
              )
            })
          )

          if (Object.keys(stillLegacy).length > 0) {
            await updateVaultsKeyShares(stillLegacy)
            await refetchQueries([StorageKey.vaults])
          }
        }

        // Whether the sample is stale needs a decryption attempt, so unlike the
        // re-wrap above this decides off stored state from the start rather than
        // off the snapshot this render captured.
        const wantsSample = await readSampleRewriteNeed(key)

        if (wantsSample) {
          const encrypted = await encryptSample({ key, value: uuidv4() })

          if (isPasscodeStale()) return

          // Re-read for the same reason as the vault re-write: a concurrent
          // change-passcode may have written its own sample while this one was
          // being derived.
          if (!(await readSampleRewriteNeed(key))) return

          const latestPasscodeEncryption = await getPasscodeEncryption()
          await setPasscodeEncryption({
            ...latestPasscodeEncryption,
            encryptedSample: encrypted,
            passcodeLength:
              latestPasscodeEncryption?.passcodeLength ?? key.length,
          })
          await refetchQueries([StorageKey.passcodeEncryption])
        }
      }),
  })
}
