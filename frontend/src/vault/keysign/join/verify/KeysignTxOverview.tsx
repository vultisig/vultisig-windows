import { useTranslation } from 'react-i18next';

import { TxOverviewAddress } from '../../../../chain/tx/components/TxOverviewAddress';
import { TxOverviewPanel } from '../../../../chain/tx/components/TxOverviewPanel';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { KeysignTxPrimaryInfo } from '../../shared/KeysignTxPrimaryInfo';
import { useKeysignPayload } from '../../shared/state/keysignPayload';

export const KeysignTxOverview = () => {
  const { coin: potentialCoin } = useKeysignPayload();

  const coin = shouldBePresent(potentialCoin);

  const { address } = shouldBePresent(coin);

  const { t } = useTranslation();

  return (
    <TxOverviewPanel>
      <TxOverviewAddress title={t('from')} value={address} />
      <KeysignTxPrimaryInfo />
    </TxOverviewPanel>
  );
};
