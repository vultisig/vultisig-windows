import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { groupChainsByDerivationPath } from '@core/chain/derivationPath'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { hasServer } from '@core/mpc/devices/localPartyId'
import { DKLS } from '@core/mpc/dkls/dkls'
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

    const groups = groupChainsByDerivationPath(chains)

    onStepComplete('prepareVault')
    onStepStart('ecdsa')
    onStepStart('eddsa')

    const [rootEcdsaResult, rootEddsaResult] = await Promise.all([
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
    ])

    const chainPublicKeys: Partial<Record<Chain, string>> = {}
    const chainKeyShares: Partial<Record<Chain, string>> = {}
    const keyShares: VaultKeyShares = {
      ecdsa: rootEcdsaResult.keyshare,
      eddsa: rootEddsaResult.keyshare,
    }

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

          return { groupChains, result }
        })
      )

      for (const { groupChains, result } of chainGroupResults) {
        for (const chain of groupChains) {
          chainPublicKeys[chain] = result.publicKey
          chainKeyShares[chain] = result.keyshare
        }
      }
      onStepComplete('chainKeys')
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
