import { useTranslation } from 'react-i18next';

import { TxOverviewPrimaryRow } from '../../../chain/tx/components/TxOverviewPrimaryRow';
import { withoutUndefined } from '../../../lib/utils/array/withoutUndefined';
import { useKeysignPayload } from '../../keysign/shared/state/keysignPayload';

export const KeysignSwapTxInfo = () => {
  const { erc20ApprovePayload } = useKeysignPayload();

  const { t } = useTranslation();

  const action = withoutUndefined([
    erc20ApprovePayload ? t('approve') : undefined,
    t('swap'),
  ]).join(` ${t('and')} `);

  return (
    <>
      <TxOverviewPrimaryRow title={t('action')}>{action}</TxOverviewPrimaryRow>
    </>
  );
};
