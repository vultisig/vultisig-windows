import React from 'react';
import { useTranslation } from 'react-i18next';

const JoinKeygen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t('joining_keygen')}</p>
    </div>
  );
};
export default JoinKeygen;
