import { create, toBinary } from '@bufbuild/protobuf'
import { useSevenZipQuery } from '@core/ui/compression/queries/useSevenZipQuery'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import {
  assertKeygenReshareFields,
  useKeygenVault,
  useKeygenVaultName,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { useMpcServiceName } from '@core/ui/mpc/state/mpcServiceName'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { toCompressedString } from '@vultisig/core-chain/utils/protobuf/toCompressedString'
import { deepLinkBaseUrl } from '@vultisig/core-config'
import { KeygenOperation } from '@vultisig/core-mpc/keygen/KeygenOperation'
import { toLibType } from '@vultisig/core-mpc/types/utils/libType'
import { toTssType } from '@vultisig/core-mpc/types/utils/tssType'
import { KeygenMessageSchema } from '@vultisig/core-mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessageSchema } from '@vultisig/core-mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { SingleKeygenMessageSchema } from '@vultisig/core-mpc/types/vultisig/keygen/v1/single_keygen_message_pb'
import { SingleKeygenType } from '@vultisig/core-mpc/types/vultisig/keygen/v1/single_keygen_type_pb'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { addQueryParams } from '@vultisig/lib-utils/query/addQueryParams'
import { useCallback } from 'react'

import { useCore } from '../../../state/core'
import { useKeyImportChains } from '../keyimport/state/keyImportChains'

export const useJoinKeygenUrlQuery = () => {
  const keyImportChains = useKeyImportChains()
  const sessionId = useMpcSessionId()
  const [serverType] = useMpcServerType()
  const serviceName = useMpcServiceName()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const hexChainCode = useCurrentHexChainCode()
  const keygenOperation = useKeygenOperation()

  const vaultName = useKeygenVaultName()

  const keygenVault = useKeygenVault()

  const { vaultCreationMpcLib } = useCore()

  return useTransformQueryData(
    useSevenZipQuery(),
    useCallback(
      sevenZip => {
        const chains = keyImportChains ?? []
        const mpcLib =
          'keyimport' in keygenOperation
            ? 'KeyImport'
            : 'existingVault' in keygenVault
              ? keygenVault.existingVault.libType
              : vaultCreationMpcLib
        const libType = toLibType(mpcLib)

        const useVultisigRelay = serverType === 'relay'

        const binary = matchRecordUnion<KeygenOperation, Uint8Array>(
          keygenOperation,
          {
            create: () => {
              const message = create(KeygenMessageSchema, {
                sessionId,
                hexChainCode,
                serviceName,
                encryptionKeyHex: hexEncryptionKey,
                useVultisigRelay,
                vaultName,
                libType,
              })
              return toBinary(KeygenMessageSchema, message)
            },
            reshare: () => {
              const message = create(ReshareMessageSchema, {
                sessionId,
                serviceName,
                encryptionKeyHex: hexEncryptionKey,
                useVultisigRelay,
                vaultName,
                ...assertKeygenReshareFields(keygenVault),
                libType,
              })
              return toBinary(ReshareMessageSchema, message)
            },
            keyimport: () => {
              const message = create(KeygenMessageSchema, {
                sessionId,
                hexChainCode,
                serviceName,
                encryptionKeyHex: hexEncryptionKey,
                useVultisigRelay,
                vaultName,
                libType,
                chains,
              })
              return toBinary(KeygenMessageSchema, message)
            },
            singleKeygen: () => {
              const existingVault =
                'existingVault' in keygenVault
                  ? keygenVault.existingVault
                  : undefined
              const message = create(SingleKeygenMessageSchema, {
                sessionId,
                hexChainCode: existingVault?.hexChainCode ?? hexChainCode,
                serviceName,
                publicKeyEcdsa: existingVault?.publicKeys.ecdsa ?? '',
                encryptionKeyHex: hexEncryptionKey,
                useVultisigRelay,
                vaultName,
                libType,
                singleKeygenType: SingleKeygenType.MLDSA,
              })
              return toBinary(SingleKeygenMessageSchema, message)
            },
          }
        )

        const jsonData = toCompressedString({
          sevenZip,
          binary,
        })
        return addQueryParams(deepLinkBaseUrl, {
          type: 'NewVault',
          tssType: toTssType(keygenOperation),
          jsonData,
        })
      },
      [
        hexChainCode,
        hexEncryptionKey,
        keygenOperation,
        keygenVault,
        keyImportChains,
        serverType,
        serviceName,
        sessionId,
        vaultCreationMpcLib,
        vaultName,
      ]
    )
  )
}
