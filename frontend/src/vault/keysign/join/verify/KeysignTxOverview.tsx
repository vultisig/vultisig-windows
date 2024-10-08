import { useTranslation } from 'react-i18next';

import { SeparatedByLine } from '../../../../lib/ui/layout/SeparatedByLine';
import { Panel } from '../../../../lib/ui/panel/Panel';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { JoinKeysignTxPrimaryInfo } from '../JoinKeysignTxPrimaryInfo';
import { useCurrentJoinKeysignPayload } from '../state/currentJoinKeysignMsg';
import { TxOverviewAddress } from './TxOverviewAddress';

export const KeysignTxOverview = () => {
  const { coin: potentialCoin } = useCurrentJoinKeysignPayload();

  const coin = shouldBePresent(potentialCoin);

  const { address } = shouldBePresent(coin);

  const { t } = useTranslation();

  return (
    <Panel>
      <SeparatedByLine gap={12}>
        <TxOverviewAddress title={t('from')} value={address} />
        <JoinKeysignTxPrimaryInfo />
      </SeparatedByLine>
    </Panel>
  );
};
