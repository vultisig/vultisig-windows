import { useTranslation } from 'react-i18next';

import {
  TxOverviewChainDataRow,
  TxOverviewRow,
} from '../../../../chain/tx/components/TxOverviewRow';
import { CustomMessagePayload } from '@core/communication/vultisig/keysign/v1/custom_message_payload_pb';
import { ValueProp } from '../../../../lib/ui/props';

export const KeysignCustomMessageInfo = ({
  value,
}: ValueProp<CustomMessagePayload>) => {
  const { t } = useTranslation();

  return (
    <>
      <TxOverviewRow>
        <span>{t('method')}</span>
        {value.method}
      </TxOverviewRow>
      <TxOverviewChainDataRow>
        <span>{t('message')}</span>
        <span>{value.message}</span>
      </TxOverviewChainDataRow>
    </>
  );
};
