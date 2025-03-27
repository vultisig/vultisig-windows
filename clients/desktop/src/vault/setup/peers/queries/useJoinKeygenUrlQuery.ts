import { create, toBinary } from '@bufbuild/protobuf'
import { toCompressedString } from '@core/chain/utils/protobuf/toCompressedString'
import { deepLinkBaseUrl } from '@core/config'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { toLibType } from '@core/mpc/types/utils/libType'
import { KeygenMessageSchema } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessageSchema } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { match } from '@lib/utils/match'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { useCallback } from 'react'

import { useSevenZipQuery } from '../../../../compression/queries/useSevenZipQuery'
import { useMpcServerType } from '../../../../mpc/serverType/state/mpcServerType'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { useMpcLib } from '../../../../mpc/state/mpcLib'
import { useCurrentServiceName } from '../../../keygen/shared/state/currentServiceName'
import { useCurrentKeygenType } from '../../../keygen/state/currentKeygenType'
import { useCurrentVault } from '../../../state/currentVault'
import { useCurrentHexChainCode } from '../../state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '../../state/currentHexEncryptionKey'

export const useJoinKeygenUrlQuery = () => {
  const sessionId = useMpcSessionId()
  const [serverType] = useMpcServerType()
  const serviceName = useCurrentServiceName()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const hexChainCode = useCurrentHexChainCode()
  const mpcLibType = useMpcLib()

  const keygenType = useCurrentKeygenType()

  const { signers, reshare_prefix, public_key_ecdsa, name } = useCurrentVault()

  return useTransformQueryData(
    useSevenZipQuery(),
    useCallback(
      sevenZip => {
        const libType = toLibType(mpcLibType)
        const useVultisigRelay = serverType === 'relay'
        const binary = match(keygenType, {
          [KeygenType.Keygen]: () => {
            const message = create(KeygenMessageSchema, {
              sessionId,
              hexChainCode,
              serviceName,
              encryptionKeyHex: hexEncryptionKey,
              useVultisigRelay,
              vaultName: name,
              libType,
            })
            return toBinary(KeygenMessageSchema, message)
          },
          [KeygenType.Reshare]: () => {
            const message = create(ReshareMessageSchema, {
              sessionId,
              hexChainCode,
              serviceName,
              encryptionKeyHex: hexEncryptionKey,
              useVultisigRelay,
              vaultName: name,
              publicKeyEcdsa: public_key_ecdsa,
              oldResharePrefix: reshare_prefix,
              oldParties: signers,
              libType,
            })
            return toBinary(ReshareMessageSchema, message)
          },
          [KeygenType.Migrate]: () => {
            const message = create(ReshareMessageSchema, {
              sessionId,
              hexChainCode,
              serviceName,
              encryptionKeyHex: hexEncryptionKey,
              useVultisigRelay,
              vaultName: name,
              publicKeyEcdsa: public_key_ecdsa,
              oldResharePrefix: reshare_prefix,
              oldParties: signers,
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
          tssType: keygenType,
          jsonData,
        })
      },
      [
        hexChainCode,
        hexEncryptionKey,
        keygenType,
        mpcLibType,
        name,
        public_key_ecdsa,
        reshare_prefix,
        serverType,
        serviceName,
        sessionId,
        signers,
      ]
    )
  )
}
