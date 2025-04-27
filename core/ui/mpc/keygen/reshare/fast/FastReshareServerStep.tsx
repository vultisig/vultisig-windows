import { generateLocalPartyId, hasServer } from '@core/mpc/devices/localPartyId'
import { reshareWithServer } from '@core/mpc/fast/api/reshareWithServer'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { WaitForServerLoader } from '@core/ui/mpc/keygen/create/fast/server/components/WaitForServerLoader'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useEmail } from '@core/ui/state/email'
import { useVaultPassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const FastReshareServerStep: React.FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()

  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()

  const [password] = useVaultPassword()

  const { name, hexChainCode, publicKeys, resharePrefix, signers } =
    useCurrentVault()

  const [email] = useEmail()

  const { mutate, ...state } = useMutation({
    mutationFn: () => {
      return reshareWithServer({
        public_key: hasServer(signers) ? publicKeys.ecdsa : undefined,
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
    onSuccess: onFinish,
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
