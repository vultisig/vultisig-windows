import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { OnForwardProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { reshareWithServer } from '../../fast/api/reshareWithServer'
import { WaitForServerLoader } from '../../server/components/WaitForServerLoader'
import { useVaultPassword } from '@core/ui/state/password'
import {
  useCurrentVault,
  useVaultServerStatus,
} from '@core/ui/vault/state/currentVault'

export const FastReshareServerStep: React.FC<OnForwardProp> = ({
  onForward,
}) => {
  const { t } = useTranslation()

  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()

  const [password] = useVaultPassword()

  const { hasServer } = useVaultServerStatus()

  const { name, signers, hexChainCode, publicKeys, resharePrefix } =
    useCurrentVault()

  const [email] = useEmail()

  const { mutate, ...state } = useMutation({
    mutationFn: () => {
      return reshareWithServer({
        public_key: hasServer ? publicKeys.ecdsa : undefined,
        session_id: sessionId,
        hex_encryption_key: hexEncryptionKey,
        encryption_password: password,
        email,
        name,
        old_parties: signers,
        hex_chain_code: hexChainCode,
        local_party_id: generateLocalPartyId('server'),
        old_reshare_prefix: resharePrefix ?? '',
      })
    },
    onSuccess: onForward,
  })

  useEffect(mutate, [mutate])

  const title = t('reshare')

  const header = (
    <PageHeader
      title={<PageHeaderTitle>{title}</PageHeaderTitle>}
      primaryControls={<PageHeaderBackButton />}
    />
  )

  return (
    <>
      <MatchQuery
        value={state}
        pending={() => (
          <>
            {header}
            <WaitForServerLoader />
          </>
        )}
        success={() => (
          <>
            {header}
            <WaitForServerLoader />
          </>
        )}
        error={error => <FullPageFlowErrorState message={error.message} />}
      />
    </>
  )
}
