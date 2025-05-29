import { create, toBinary } from '@bufbuild/protobuf'
import { toCompressedString } from '@core/chain/utils/protobuf/toCompressedString'
import { deepLinkBaseUrl } from '@core/config'
import { toLibType } from '@core/mpc/types/utils/libType'
import { toTssType } from '@core/mpc/types/utils/tssType'
import { KeygenMessageSchema } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessageSchema } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { useSevenZipQuery } from '@core/ui/compression/queries/useSevenZipQuery'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
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
import { useVaultCreationMpcLib } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { match } from '@lib/utils/match'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { useCallback } from 'react'

export const useJoinKeygenUrlQuery = () => {
  const sessionId = useMpcSessionId()
  const [serverType] = useMpcServerType()
  const serviceName = useMpcServiceName()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const hexChainCode = useCurrentHexChainCode()

  const keygenType = useCurrentKeygenType()

  const vaultName = useKeygenVaultName()

  const keygenVault = useKeygenVault()

  const vaultCreationMpcLib = useVaultCreationMpcLib()

  return useTransformQueryData(
    useSevenZipQuery(),
    useCallback(
      sevenZip => {
        const libType = toLibType(
          'existingVault' in keygenVault
            ? keygenVault.existingVault.libType
            : vaultCreationMpcLib
        )

        const useVultisigRelay = serverType === 'relay'
        const binary = match(keygenType, {
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
          migrate: () => {
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
        })

        const jsonData = toCompressedString({
          sevenZip,
          binary,
        })

        return addQueryParams(deepLinkBaseUrl, {
          type: 'NewVault',
          tssType: toTssType(keygenType),
          jsonData,
        })
      },
      [
        hexChainCode,
        hexEncryptionKey,
        keygenType,
        keygenVault,
        serverType,
        serviceName,
        sessionId,
        vaultCreationMpcLib,
        vaultName,
      ]
    )
  )
}
