import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { TxOverviewAddress } from '../../../chain/tx/components/TxOverviewAddress';
import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { TxOverviewRow } from '../../../chain/tx/components/TxOverviewRow';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Button } from '../../../lib/ui/buttons/Button';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { ISendTransaction, TransactionType } from '../../../model/transaction';
import { makeAppPath } from '../../../navigation';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import {
  useAssertCurrentVault,
  useAssertCurrentVaultAddress,
  useAssertCurrentVaultCoin,
} from '../../state/useCurrentVault';
import { SendNetworkFeeValue } from '../fee/SendNetworkFeeValue';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';
import { useSendAmount } from '../state/amount';
import { useSendReceiver } from '../state/receiver';
import { useCurrentSendCoin } from '../state/sendCoin';

export const SendVerify: React.FC<ComponentWithBackActionProps> = ({
  onBack,
}) => {
  const { t } = useTranslation();

  const [coinKey] = useCurrentSendCoin();
  const address = useAssertCurrentVaultAddress(coinKey.chainId);
  const coin = useAssertCurrentVaultCoin(coinKey);
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();
  const vault = useAssertCurrentVault();

  const navigate = useNavigate();

  const walletCore = useAssertWalletCore();

  const specificTxInfoQuery = useSpecificSendTxInfoQuery();

  const onSubmit = () => {
    const tx: ISendTransaction = {
      fromAddress: address,
      toAddress: receiver,
      amount: shouldBePresent(amount),
      memo: '',
      coin: new Coin(coin),
      transactionType: TransactionType.SEND,
      specificTransactionInfo: shouldBePresent(specificTxInfoQuery.data),
      sendMaxAmount: false,
    };

    const payload = BlockchainServiceFactory.createService(
      coinKey.chainId,
      walletCore
    ).createKeysignPayload(tx, vault.local_party_id, vault.public_key_ecdsa);

    navigate(makeAppPath('keysign'), {
      state: {
        vault,
        keysignPayload: payload,
      },
    });
  };

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <TxOverviewAddress title={t('from')} value={address} />
            <TxOverviewAddress title={t('to')} value={receiver} />
            <TxOverviewAmount
              value={shouldBePresent(amount)}
              symbol={coin.ticker}
            />
            <TxOverviewRow>
              <Text>{t('network_fee')}</Text>
              <SendNetworkFeeValue />
            </TxOverviewRow>
          </TxOverviewPanel>
        </WithProgressIndicator>
        <QueryDependant
          query={specificTxInfoQuery}
          success={() => <Button onClick={onSubmit}>{t('continue')}</Button>}
          error={() => <Text>{t('failed_to_load')}</Text>}
          pending={() => <Button isLoading>{t('continue')}</Button>}
        />
      </PageContent>
    </>
  );
};
