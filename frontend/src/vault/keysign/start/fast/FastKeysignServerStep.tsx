import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ComponentWithForwardActionProps } from '../../../../lib/ui/props';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { Chain, ChainUtils, TssKeysignType } from '../../../../model/chain';
import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { CoinServiceFactory } from '../../../../services/Coin/CoinServiceFactory';
import { FullPageFlowErrorState } from '../../../../ui/flow/FullPageFlowErrorState';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { WaitForServerLoader } from '../../../server/components/WaitForServerLoader';
import { useVaultPassword } from '../../../server/password/state/password';
import { signWithServer } from '../../../server/utils/signWithServer';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useAssertCurrentVault } from '../../../state/useCurrentVault';
import { useCurrentKeysignMsgs } from '../../shared/state/currentKeysignMsgs';
import { useKeysignPayload } from '../../shared/state/keysignPayload';

export const FastKeysignServerStep: React.FC<
  ComponentWithForwardActionProps
> = ({ onForward }) => {
  const { t } = useTranslation();

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
        session: sessionId,
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

  const title = t('fast_sign');

  const header = (
    <PageHeader
      title={<PageHeaderTitle>{title}</PageHeaderTitle>}
      primaryControls={<PageHeaderBackButton />}
    />
  );

  return (
    <>
      <QueryDependant
        query={state}
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
