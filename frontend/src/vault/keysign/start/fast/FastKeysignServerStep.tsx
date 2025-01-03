import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getPreSigningHashes } from '../../../../chain/tx/utils/getPreSigningHashes';
import { getCoinType } from '../../../../chain/walletCore/getCoinType';
import { hexEncode } from '../../../../chain/walletCore/hexEncode';
import { ComponentWithForwardActionProps } from '../../../../lib/ui/props';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../../../model/chain';
import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { FullPageFlowErrorState } from '../../../../ui/flow/FullPageFlowErrorState';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { signWithServer } from '../../../fast/api/signWithServer';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { WaitForServerLoader } from '../../../server/components/WaitForServerLoader';
import { useVaultPassword } from '../../../server/password/state/password';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useCurrentVault } from '../../../state/currentVault';
import { useKeysignPayload } from '../../shared/state/keysignPayload';
import { useKeysignTxInputData } from '../../shared/state/keysignTxInputData';
import { getTssKeysignType } from '../../utils/getTssKeysignType';

export const FastKeysignServerStep: React.FC<
  ComponentWithForwardActionProps
> = ({ onForward }) => {
  const { t } = useTranslation();

  const { public_key_ecdsa } = useCurrentVault();

  const sessionId = useCurrentSessionId();
  const hexEncryptionKey = useCurrentHexEncryptionKey();

  const payload = useKeysignPayload();

  const coin = shouldBePresent(payload.coin);

  const walletCore = useAssertWalletCore();

  const [password] = useVaultPassword();

  const inputs = useKeysignTxInputData();

  const { mutate, ...state } = useMutation({
    mutationFn: () => {
      const chain = coin.chain as Chain;

      const messages = inputs.flatMap(txInputData =>
        getPreSigningHashes({
          txInputData,
          walletCore,
          chain,
        }).map(value =>
          hexEncode({
            value,
            walletCore,
          })
        )
      );

      return signWithServer({
        public_key: public_key_ecdsa,
        messages,
        session: sessionId,
        hex_encryption_key: hexEncryptionKey,
        derive_path: walletCore.CoinTypeExt.derivationPath(
          getCoinType({ walletCore, chain })
        ),
        is_ecdsa: getTssKeysignType(chain) === 'ecdsa',
        vault_password: password,
      });
    },
    onSuccess: onForward,
  });

  useEffect(mutate, [mutate]);

  const title = t('fast_sign');

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
