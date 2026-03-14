import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { groupChainsByDerivationPath } from '@core/chain/derivationPath'
import { frostOnlyChains } from '@core/chain/froztChains'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { hasServer } from '@core/mpc/devices/localPartyId'
import { DKLS } from '@core/mpc/dkls/dkls'
import { parseFromtBundleResult } from '@core/mpc/fromt/fromtSession'
import { createFromtImportSession } from '@core/mpc/fromt/fromtSessionFactory'
import {
  parseFroztBundleResult,
  runFroztSession,
} from '@core/mpc/frozt/froztSession'
import { createFroztImportSession } from '@core/mpc/frozt/froztSessionFactory'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@core/mpc/keygenComplete'
import { MpcLib } from '@core/mpc/mpcLib'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import { Vault, VaultKeyShares } from '@core/mpc/vault/Vault'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'

import { KeygenAction, KeygenActionProvider } from '../state/keygenAction'
import { useKeygenVaultName } from '../state/keygenVault'
import {
  parseKeyImportChains,
  useKeyImportChains,
} from './state/keyImportChains'

export const JoinKeyImportKeygenActionProvider = ({
  children,
}: ChildrenProp) => {
  const serverUrl = useMpcServerUrl()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const hexChainCode = useCurrentHexChainCode()
  const sessionId = useMpcSessionId()
  const vaultName = useKeygenVaultName()
  const localPartyId = useMpcLocalPartyId()
  const isInitiatingDevice = useIsInitiatingDevice()
  const vaultOrders = useVaultOrders()
  const keyImportChainsRaw = useKeyImportChains()

  const keygenAction: KeygenAction = async ({
    onStepStart,
    onStepComplete,
    signers,
  }) => {
    const chains = parseKeyImportChains(shouldBePresent(keyImportChainsRaw))

    onStepStart('prepareVault')

    const sharedDklsParams = {
      isInitiateDevice: isInitiatingDevice,
      serverUrl,
      sessionId,
      localPartyId,
      signers,
      oldKeygenCommittee: [] as string[],
      hexEncryptionKey: encryptionKeyHex,
    }

    const dklsKeygen = new DKLS(
      { keyimport: true },
      sharedDklsParams.isInitiateDevice,
      sharedDklsParams.serverUrl,
      sharedDklsParams.sessionId,
      sharedDklsParams.localPartyId,
      sharedDklsParams.signers,
      sharedDklsParams.oldKeygenCommittee,
      sharedDklsParams.hexEncryptionKey
    )

    const schnorrKeygen = new Schnorr(
      { keyimport: true },
      sharedDklsParams.isInitiateDevice,
      sharedDklsParams.serverUrl,
      sharedDklsParams.sessionId,
      sharedDklsParams.localPartyId,
      sharedDklsParams.signers,
      sharedDklsParams.oldKeygenCommittee,
      sharedDklsParams.hexEncryptionKey,
      new Uint8Array()
    )

    const hasFrozt = chains.includes(Chain.ZcashSapling)
    const hasFromt = chains.includes(Chain.Monero)

    const froztSession = hasFrozt
      ? await createFroztImportSession({
          serverUrl,
          sessionId,
          localPartyId,
          hexEncryptionKey: encryptionKeyHex,
          setupMessageId: 'frozt',
          isInitiatingDevice,
          signers,
          seed: new Uint8Array(),
          accountIndex: 0,
          birthday: 0,
        })
      : null

    const fromtSession = hasFromt
      ? await createFromtImportSession({
          serverUrl,
          sessionId,
          localPartyId,
          hexEncryptionKey: encryptionKeyHex,
          setupMessageId: 'fromt',
          isInitiatingDevice,
          signers,
          seed: new Uint8Array(),
          birthday: 0,
        })
      : null

    const batchStart = Date.now()

    const frostPromises: Promise<Uint8Array | null>[] = []

    if (froztSession) {
      frostPromises.push(
        runFroztSession({
          session: froztSession,
          messageId: 'p-frozt',
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          hexEncryptionKey: encryptionKeyHex,
        }).then(r => {
          onStepComplete('frozt')
          return r
        })
      )
    }

    if (fromtSession) {
      frostPromises.push(
        runFroztSession({
          session: fromtSession,
          messageId: 'p-fromt',
          serverUrl,
          sessionId,
          localPartyId,
          signers,
          hexEncryptionKey: encryptionKeyHex,
        }).then(r => {
          onStepComplete('fromt')
          return r
        })
      )
    }

    onStepComplete('prepareVault')
    onStepStart('ecdsa')
    onStepStart('eddsa')
    if (hasFrozt) onStepStart('frozt')
    if (hasFromt) onStepStart('fromt')

    const [rootEcdsaResult, rootEddsaResult, ...frostResults] =
      await Promise.all([
        dklsKeygen
          .startKeyImportWithRetry('', hexChainCode, undefined, 'p-ecdsa')
          .then(r => {
            onStepComplete('ecdsa')
            return r
          }),
        schnorrKeygen
          .startKeyImportWithRetry(
            '',
            hexChainCode,
            'eddsa_key_import',
            'p-eddsa'
          )
          .then(r => {
            onStepComplete('eddsa')
            return r
          }),
        ...frostPromises,
      ])

    console.log(
      `[key-import-join] root protocols complete in ${Date.now() - batchStart}ms`
    )

    const chainPublicKeys: Partial<Record<Chain, string>> = {}
    const chainKeyShares: Partial<Record<Chain, string>> = {}
    let saplingExtras: string | undefined

    let frostIdx = 0
    if (hasFrozt) {
      const froztResult = parseFroztBundleResult(
        frostResults[frostIdx++] as Uint8Array
      )
      chainPublicKeys[Chain.ZcashSapling] = froztResult.pubKeyPackage
      chainKeyShares[Chain.ZcashSapling] = froztResult.bundle
      saplingExtras = froztResult.saplingExtras || undefined
    }
    if (hasFromt) {
      const fromtResult = parseFromtBundleResult(
        frostResults[frostIdx++] as Uint8Array
      )
      chainPublicKeys[Chain.Monero] = fromtResult.pubKey
      chainKeyShares[Chain.Monero] = fromtResult.keyShare
    }
    const keyShares: VaultKeyShares = {
      ecdsa: rootEcdsaResult.keyshare,
      eddsa: rootEddsaResult.keyshare,
    }

    const nonFrostChains = chains.filter(c => !frostOnlyChains.includes(c))
    const groups = groupChainsByDerivationPath(nonFrostChains)

    if (groups.length > 0) {
      onStepStart('chainKeys')
      const chainGroupResults = await Promise.all(
        groups.map(async ({ groupId, chains: groupChains }) => {
          const representativeChain = groupChains[0]
          const chainKind = getChainKind(representativeChain)
          const algorithm = signatureAlgorithms[chainKind]

          const chainCodeToUse =
            algorithm === 'ecdsa'
              ? rootEcdsaResult.chaincode
              : rootEddsaResult.chaincode

          let result
          if (algorithm === 'ecdsa') {
            const chainDkls = new DKLS(
              { keyimport: true },
              sharedDklsParams.isInitiateDevice,
              sharedDklsParams.serverUrl,
              sharedDklsParams.sessionId,
              sharedDklsParams.localPartyId,
              sharedDklsParams.signers,
              sharedDklsParams.oldKeygenCommittee,
              sharedDklsParams.hexEncryptionKey
            )
            result = await chainDkls.startKeyImportWithRetry(
              '',
              chainCodeToUse,
              groupId,
              `p-${groupId}`
            )
          } else {
            const chainSchnorr = new Schnorr(
              { keyimport: true },
              sharedDklsParams.isInitiateDevice,
              sharedDklsParams.serverUrl,
              sharedDklsParams.sessionId,
              sharedDklsParams.localPartyId,
              sharedDklsParams.signers,
              sharedDklsParams.oldKeygenCommittee,
              sharedDklsParams.hexEncryptionKey,
              new Uint8Array()
            )
            result = await chainSchnorr.startKeyImportWithRetry(
              '',
              chainCodeToUse,
              groupId,
              `p-${groupId}`
            )
          }

          onStepComplete('chainKeys')
          return { groupChains, result }
        })
      )

      for (const { groupChains, result } of chainGroupResults) {
        for (const chain of groupChains) {
          chainPublicKeys[chain] = result.publicKey
          chainKeyShares[chain] = result.keyshare
        }
      }
    }

    const vault: Vault = {
      name: vaultName,
      publicKeys: {
        ecdsa: rootEcdsaResult.publicKey,
        eddsa: rootEddsaResult.publicKey,
      },
      signers,
      createdAt: Date.now(),
      hexChainCode: rootEcdsaResult.chaincode,
      keyShares,
      localPartyId,
      libType: 'KeyImport' as MpcLib,
      isBackedUp: false,
      order: getLastItemOrder(vaultOrders),
      lastPasswordVerificationTime: hasServer(signers) ? Date.now() : undefined,
      chainPublicKeys,
      chainKeyShares,
      saplingExtras,
    }

    await setKeygenComplete({
      serverURL: serverUrl,
      sessionId,
      localPartyId,
    })

    await waitForKeygenComplete({
      serverURL: serverUrl,
      sessionId,
      peers: without(signers, localPartyId),
    })

    return vault
  }

  return (
    <KeygenActionProvider value={keygenAction}>{children}</KeygenActionProvider>
  )
}
