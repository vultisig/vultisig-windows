import React from 'react';
import { useTranslation } from 'react-i18next';

const KeygenDone: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center text-white">
      <img
        src="/assets/icons/done.svg"
        alt="done"
        className="mx-auto mt-[30vh] mb-6"
      />
      <p className="text-2xl font-bold">{t('done')}</p>
      <div className="w-full fixed bottom-16 text-center">
        <img
          src="/assets/icons/wifi.svg"
          alt="wifi"
          className="mx-auto mb-4 w-8"
        />
        <p className="mb-4">{t('devices_on_same_wifi')}</p>
      </div>
    </div>
  );
};

export default KeygenDone;
