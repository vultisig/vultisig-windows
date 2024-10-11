import { useTranslation } from 'react-i18next';

import { SendFeeValue } from './SendFeeValue';

export const SendFee = () => {
  const { t } = useTranslation();

  return (
    <>
      <span>
        {t('gas')} ({t('auto')})
      </span>
      <SendFeeValue />
    </>
  );
};
