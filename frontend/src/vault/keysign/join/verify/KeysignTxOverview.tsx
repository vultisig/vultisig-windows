import { useTranslation } from 'react-i18next';

import { TxOverviewPanel } from '../../../../chain/tx/components/TxOverviewPanel';
import { TxOverviewPrimaryRow } from '../../../../chain/tx/components/TxOverviewPrimaryRow';
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
      <TxOverviewPrimaryRow title={t('from')}>{address}</TxOverviewPrimaryRow>
      <KeysignTxPrimaryInfo />
    </TxOverviewPanel>
  );
};
