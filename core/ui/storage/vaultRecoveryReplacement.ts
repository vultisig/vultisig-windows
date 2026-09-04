import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'

const recordsEqual = (
  left: Record<string, string> | undefined,
  right: Record<string, string> | undefined
) => {
  const leftKeys = Object.keys(left ?? {})
  const rightKeys = Object.keys(right ?? {})

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(key => left?.[key] === right?.[key])
  )
}

const preservesIdentity = (
  stored: string | undefined,
  incoming: string | undefined
) => !stored || stored === incoming

const hasValue = (value: string | undefined) => Boolean(value?.trim())

/**
 * Revalidates the destructive recovery exception at the storage boundary.
 * The expected vault is the exact unreadable snapshot that opened recovery;
 * if another operation changed its identities or shares, replacement fails
 * closed instead of overwriting the newer state.
 */
export const assertVaultRecoveryReplacement = ({
  currentVault,
  expectedVault,
  replacementVault,
}: {
  currentVault: Vault
  expectedVault: Vault
  replacementVault: Vault
}) => {
  const currentId = getVaultId(currentVault)

  if (
    currentId !== getVaultId(expectedVault) ||
    currentId !== getVaultId(replacementVault)
  ) {
    throw new Error('Recovery replacement no longer targets the same vault')
  }

  const currentStateIsExpected =
    currentVault.libType === expectedVault.libType &&
    recordsEqual(currentVault.publicKeys, expectedVault.publicKeys) &&
    recordsEqual(currentVault.keyShares, expectedVault.keyShares) &&
    recordsEqual(currentVault.chainPublicKeys, expectedVault.chainPublicKeys) &&
    recordsEqual(currentVault.chainKeyShares, expectedVault.chainKeyShares) &&
    currentVault.publicKeyMldsa === expectedVault.publicKeyMldsa &&
    currentVault.keyShareMldsa === expectedVault.keyShareMldsa &&
    currentVault.saplingExtras === expectedVault.saplingExtras

  if (!currentStateIsExpected) {
    throw new Error('Vault changed while recovery was in progress')
  }

  if (
    currentVault.libType !== replacementVault.libType ||
    !preservesIdentity(
      currentVault.publicKeys.ecdsa,
      replacementVault.publicKeys.ecdsa
    ) ||
    !preservesIdentity(
      currentVault.publicKeys.eddsa,
      replacementVault.publicKeys.eddsa
    ) ||
    !preservesIdentity(
      currentVault.publicKeyMldsa,
      replacementVault.publicKeyMldsa
    ) ||
    !preservesIdentity(
      currentVault.saplingExtras,
      replacementVault.saplingExtras
    )
  ) {
    throw new Error('Recovery backup does not preserve every vault identity')
  }

  const storedRootShareKeys = getRecordKeys(currentVault.keyShares).filter(
    key => hasValue(currentVault.keyShares[key])
  )
  if (
    storedRootShareKeys.some(
      key =>
        !preservesIdentity(
          currentVault.publicKeys[key],
          replacementVault.publicKeys[key]
        ) || !hasValue(replacementVault.keyShares[key])
    )
  ) {
    throw new Error('Recovery backup omits a stored vault key share')
  }

  const storedChainKeys = new Set([
    ...getRecordKeys(currentVault.chainPublicKeys ?? {}),
    ...getRecordKeys(currentVault.chainKeyShares ?? {}),
  ])
  for (const chain of storedChainKeys) {
    if (
      !preservesIdentity(
        currentVault.chainPublicKeys?.[chain],
        replacementVault.chainPublicKeys?.[chain]
      ) ||
      !hasValue(replacementVault.chainKeyShares?.[chain])
    ) {
      throw new Error('Recovery backup omits a stored chain key share')
    }
  }

  if (
    hasValue(currentVault.keyShareMldsa) &&
    !hasValue(replacementVault.keyShareMldsa)
  ) {
    throw new Error('Recovery backup omits the stored MLDSA key share')
  }

  if (
    replacementVault.libType !== 'KeyImport' &&
    (!hasValue(replacementVault.keyShares.ecdsa) ||
      !hasValue(replacementVault.keyShares.eddsa))
  ) {
    throw new Error('Recovery backup omits a declared vault key share')
  }

  if (
    replacementVault.publicKeyMldsa &&
    !hasValue(replacementVault.keyShareMldsa)
  ) {
    throw new Error('Recovery backup omits the declared MLDSA key share')
  }

  if (
    Object.values(replacementVault.chainKeyShares ?? {}).some(
      value => !hasValue(value)
    )
  ) {
    throw new Error('Recovery backup contains an incomplete chain key share')
  }

  const hasIncomingShare = [
    ...Object.values(replacementVault.keyShares),
    ...Object.values(replacementVault.chainKeyShares ?? {}),
    replacementVault.keyShareMldsa,
  ].some(hasValue)

  if (!hasIncomingShare) {
    throw new Error('Recovery backup does not contain complete key shares')
  }

  for (const chain of getRecordKeys(replacementVault.chainPublicKeys ?? {})) {
    if (!hasValue(replacementVault.chainKeyShares?.[chain])) {
      throw new Error('Recovery backup omits a declared chain key share')
    }
  }
}
