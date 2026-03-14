import { Chain } from '@core/chain/Chain'
import { initializeFrozt } from '@core/mpc/frozt/initialize'
import { Vault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { frozt_keyshare_bundle_birthday } from 'frozt-wasm'

import { getZcashZAddress } from './getZcashZAddress'
import { getZcashScanStorage } from './zcashScanStorage'

type ZcashSaplingVaultSetup = {
  address: string
  publicKeyEcdsa: string
  pubKeyPackage: string
  saplingExtras: string
  birthHeight: number | null
}

type ZcashSaplingVaultInput = Pick<
  Vault,
  'publicKeys' | 'chainPublicKeys' | 'chainKeyShares' | 'saplingExtras'
>

export const getZcashSaplingBirthHeight = async (
  bundleBase64: string
): Promise<number | null> => {
  try {
    await initializeFrozt()

    const birthday = Number(
      frozt_keyshare_bundle_birthday(Buffer.from(bundleBase64, 'base64'))
    )

    return birthday > 0 ? birthday : null
  } catch {
    return null
  }
}

export const getZcashSaplingVaultSetup = async (
  vault: ZcashSaplingVaultInput
): Promise<ZcashSaplingVaultSetup> => {
  const pubKeyPackage = shouldBePresent(
    vault.chainPublicKeys?.[Chain.ZcashSapling],
    'Frozt public key package'
  )
  const saplingExtras = shouldBePresent(vault.saplingExtras, 'Sapling extras')
  const bundle = shouldBePresent(
    vault.chainKeyShares?.[Chain.ZcashSapling],
    'Frozt keyshare bundle'
  )

  const [address, birthHeight] = await Promise.all([
    getZcashZAddress(pubKeyPackage, saplingExtras),
    getZcashSaplingBirthHeight(bundle),
  ])

  return {
    address,
    publicKeyEcdsa: vault.publicKeys.ecdsa,
    pubKeyPackage,
    saplingExtras,
    birthHeight,
  }
}

export const ensureZcashSaplingScanState = async (
  vault: ZcashSaplingVaultInput
): Promise<ZcashSaplingVaultSetup> => {
  const setup = await getZcashSaplingVaultSetup(vault)
  const storage = getZcashScanStorage()
  const existing = await storage.load(setup.publicKeyEcdsa)

  if (!existing) {
    await storage.save({
      zAddress: setup.address,
      publicKeyEcdsa: setup.publicKeyEcdsa,
      scanHeight: null,
      scanTarget: null,
      birthHeight: setup.birthHeight,
      birthdayScanDone: false,
      pubKeyPackage: setup.pubKeyPackage,
      saplingExtras: setup.saplingExtras,
      notes: [],
    })

    return setup
  }

  await storage.save({
    ...existing,
    zAddress: setup.address,
    publicKeyEcdsa: setup.publicKeyEcdsa,
    pubKeyPackage: setup.pubKeyPackage,
    saplingExtras: setup.saplingExtras,
    birthHeight: existing.birthHeight ?? setup.birthHeight,
    birthdayScanDone: existing.birthdayScanDone,
    scanHeight: existing.scanHeight,
    scanTarget: existing.scanTarget,
  })

  return setup
}
