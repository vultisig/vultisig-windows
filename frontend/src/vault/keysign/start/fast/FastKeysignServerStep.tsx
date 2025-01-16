import { useMutation } from '@tanstack/react-query';
import { keccak256 } from 'js-sha3';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getPreSigningHashes } from '../../../../chain/tx/utils/getPreSigningHashes';
import { assertChainField } from '../../../../chain/utils/assertChainField';
import { getCoinType } from '../../../../chain/walletCore/getCoinType';
import { hexEncode } from '../../../../chain/walletCore/hexEncode';
import { ComponentWithForwardActionProps } from '../../../../lib/ui/props';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { matchRecordUnion } from '../../../../lib/utils/matchRecordUnion';
import { assertField } from '../../../../lib/utils/record/assertField';
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
import { customMessageConfig } from '../../customMessage/config';
import { useKeysignMessagePayload } from '../../shared/state/keysignMessagePayload';
import { getTssKeysignType } from '../../utils/getTssKeysignType';
import { getTxInputData } from '../../utils/getTxInputData';

export const FastKeysignServerStep: React.FC<
  ComponentWithForwardActionProps
> = ({ onForward }) => {
  const { t } = useTranslation();

  const { public_key_ecdsa } = useCurrentVault();

  const sessionId = useCurrentSessionId();
  const hexEncryptionKey = useCurrentHexEncryptionKey();

  const payload = useKeysignMessagePayload();

  const walletCore = useAssertWalletCore();

  const [password] = useVaultPassword();

  const { mutate, ...state } = useMutation({
    mutationFn: async () => {
      return matchRecordUnion(payload, {
        keysign: async keysignPayload => {
          const inputs = await getTxInputData({
            keysignPayload,
            walletCore,
          });

          const coin = assertField(keysignPayload, 'coin');
          const { chain } = assertChainField(coin);

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
        custom: ({ message }) => {
          return signWithServer({
            public_key: public_key_ecdsa,
            messages: [keccak256(message)],
            session: sessionId,
            hex_encryption_key: hexEncryptionKey,
            derive_path: walletCore.CoinTypeExt.derivationPath(
              getCoinType({
                walletCore,
                chain: customMessageConfig.chain,
              })
            ),
            is_ecdsa: customMessageConfig.tssType === 'ecdsa',
            vault_password: password,
          });
        },
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
