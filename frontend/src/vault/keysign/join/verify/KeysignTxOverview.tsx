import { useTranslation } from 'react-i18next';

import { TxOverviewAddress } from '../../../../chain/tx/components/TxOverviewAddress';
import { TxOverviewPanel } from '../../../../chain/tx/components/TxOverviewPanel';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { JoinKeysignTxPrimaryInfo } from '../JoinKeysignTxPrimaryInfo';
import { useCurrentJoinKeysignPayload } from '../state/currentJoinKeysignMsg';

export const KeysignTxOverview = () => {
  const { coin: potentialCoin } = useCurrentJoinKeysignPayload();

  const coin = shouldBePresent(potentialCoin);

  const { address } = shouldBePresent(coin);

  const { t } = useTranslation();

  return (
    <TxOverviewPanel>
      <TxOverviewAddress title={t('from')} value={address} />
      <JoinKeysignTxPrimaryInfo />
    </TxOverviewPanel>
  );
};
