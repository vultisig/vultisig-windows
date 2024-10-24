import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ComponentWithForwardActionProps } from '../../../../lib/ui/props';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { Chain, ChainUtils, TssKeysignType } from '../../../../model/chain';
import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { CoinServiceFactory } from '../../../../services/Coin/CoinServiceFactory';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { KeygenFailedState } from '../../../keygen/shared/KeygenFailedState';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { signWithServer } from '../../../server/utils/signWithServer';
import { useVaultPassword } from '../../../setup/fast/password/state/password';
import { SetupFastVaultServerLoader } from '../../../setup/fast/SetupFastVaultServerLoader';
import { useVaultType } from '../../../setup/shared/state/vaultType';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useAssertCurrentVault } from '../../../state/useCurrentVault';
import { useCurrentKeysignMsgs } from '../../shared/state/currentKeysignMsgs';
import { useKeysignPayload } from '../../shared/state/keysignPayload';

export const FastKeysignServerStep: React.FC<
  ComponentWithForwardActionProps
> = ({ onForward }) => {
  const { t } = useTranslation();
  const type = useVaultType();

  const { public_key_ecdsa } = useAssertCurrentVault();

  const sessionId = useCurrentSessionId();
  const hexEncryptionKey = useCurrentHexEncryptionKey();

  const payload = useKeysignPayload();

  const coin = shouldBePresent(payload.coin);

  const walletCore = useAssertWalletCore();

  const [password] = useVaultPassword();

  const messages = useCurrentKeysignMsgs();

  const { mutate, ...state } = useMutation({
    mutationFn: () => {
      const chain = coin.chain as Chain;

      const coinService = CoinServiceFactory.createCoinService(
        chain,
        walletCore
      );

      return signWithServer({
        public_key: public_key_ecdsa,
        messages,
        session_id: sessionId,
        hex_encryption_key: hexEncryptionKey,
        derive_path: walletCore.CoinTypeExt.derivationPath(
          coinService.getCoinType()
        ),
        is_ecdsa: ChainUtils.getTssKeysignType(chain) === TssKeysignType.ECDSA,
        vault_password: password,
      });
    },
    onSuccess: onForward,
  });

  useEffect(mutate, [mutate]);

  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={
          <PageHeaderTitle>
            {t('keygen_for_vault', { type: t(type) })}
          </PageHeaderTitle>
        }
        primaryControls={<PageHeaderBackButton />}
      />
      <QueryDependant
        query={state}
        pending={() => <SetupFastVaultServerLoader />}
        success={() => null}
        error={error => (
          <KeygenFailedState
            message={error.message}
            onTryAgain={() => navigate(-1)}
          />
        )}
      />
    </>
  );
};
