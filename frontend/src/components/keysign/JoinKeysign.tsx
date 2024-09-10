import React from 'react';
import { useTranslation } from 'react-i18next';
const JoinKeysign: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t('joining_keysign')}</p>
    </div>
  );
};
export default JoinKeysign;
