import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { OnForwardProp } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { reshareWithServer } from '../../fast/api/reshareWithServer';
import { useCurrentSessionId } from '../../keygen/shared/state/currentSessionId';
import { generateLocalPartyId } from '../../keygen/utils/localPartyId';
import { WaitForServerLoader } from '../../server/components/WaitForServerLoader';
import { useVaultEmail } from '../../server/email/state/email';
import { useVaultPassword } from '../../server/password/state/password';
import { useCurrentHexEncryptionKey } from '../../setup/state/currentHexEncryptionKey';
import {
  useCurrentVault,
  useVaultServerStatus,
} from '../../state/currentVault';

export const FastReshareServerStep: React.FC<OnForwardProp> = ({
  onForward,
}) => {
  const { t } = useTranslation();

  const sessionId = useCurrentSessionId();
  const hexEncryptionKey = useCurrentHexEncryptionKey();

  const [password] = useVaultPassword();

  const { hasServer } = useVaultServerStatus();

  const { name, signers, hex_chain_code, public_key_ecdsa, reshare_prefix } =
    useCurrentVault();

  const [email] = useVaultEmail();

  const { mutate, ...state } = useMutation({
    mutationFn: () => {
      return reshareWithServer({
        public_key: hasServer ? public_key_ecdsa : undefined,
        session_id: sessionId,
        hex_encryption_key: hexEncryptionKey,
        encryption_password: password,
        email,
        name,
        old_parties: signers,
        hex_chain_code,
        local_party_id: generateLocalPartyId('server'),
        old_reshare_prefix: reshare_prefix,
      });
    },
    onSuccess: onForward,
  });

  useEffect(mutate, [mutate]);

  const title = t('reshare');

  const header = (
    <PageHeader
      title={<PageHeaderTitle>{title}</PageHeaderTitle>}
      primaryControls={<PageHeaderBackButton />}
    />
  );

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
        error={error => (
          <FullPageFlowErrorState title={title} message={error.message} />
        )}
      />
    </>
  );
};
