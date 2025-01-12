import { useTranslation } from 'react-i18next';

import { TxOverviewPrimaryRow } from '../../../../chain/tx/components/TxOverviewPrimaryRow';
import { CustomMessagePayload } from '../../../../gen/vultisig/keysign/v1/custom_message_payload_pb';
import { ComponentWithValueProps } from '../../../../lib/ui/props';

export const KeysignCustomMessageInfo = ({
  value,
}: ComponentWithValueProps<CustomMessagePayload>) => {
  const { t } = useTranslation();

  return (
    <>
      <TxOverviewPrimaryRow title={t('method')}>
        {value.method}
      </TxOverviewPrimaryRow>
      <TxOverviewPrimaryRow title={t('message')}>
        {value.message}
      </TxOverviewPrimaryRow>
    </>
  );
};
