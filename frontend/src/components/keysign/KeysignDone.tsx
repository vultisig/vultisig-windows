import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface KeysignDoneProps {
  onNext: () => void;
}

const KeysignDone: React.FC<KeysignDoneProps> = ({ onNext }) => {
  const { t } = useTranslation();

  useEffect(() => {
    setTimeout(() => {
      onNext();
    }, 3000);
  }, []);

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

export default KeysignDone;
