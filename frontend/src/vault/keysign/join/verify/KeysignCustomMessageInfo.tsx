import { useTranslation } from 'react-i18next';

import {
  TxOverviewChainDataRow,
  TxOverviewRow,
} from '../../../../chain/tx/components/TxOverviewRow';
import { CustomMessagePayload } from '../../../../gen/vultisig/keysign/v1/custom_message_payload_pb';
import { ComponentWithValueProps } from '../../../../lib/ui/props';

export const KeysignCustomMessageInfo = ({
  value,
}: ComponentWithValueProps<CustomMessagePayload>) => {
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
