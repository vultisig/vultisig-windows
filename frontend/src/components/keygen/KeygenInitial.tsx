import React from 'react';
import { useTranslation } from 'react-i18next';

interface KeygenInitialProps {
  onContinue: () => void;
}

const KeygenInitial: React.FC<KeygenInitialProps> = ({ onContinue }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-around mt-48 px-20">
      <div className="w-80 h-80 bg-btn-primary rounded-2xl p-8 flex flex-col items-center justify-center">
        <img
          src="/assets/icons/initiate.svg"
          alt="create_qr"
          className="mt-12"
        />
        <p className="mt-4 text-sm text-[#BBC1C7]">{t('this_device_is_the')}</p>
        <p className="mt-2 text-xl font-bold text-white">
          {t('initiating_device')}
        </p>
        <button
          className="text-lg rounded-full w-full font-bold py-2 mt-12 text-sm text-btn-primary bg-secondary"
          onClick={onContinue}
        >
          {t('create_qr')}
        </button>
      </div>
      <div className="w-80 h-80 bg-btn-primary rounded-2xl p-8 flex flex-col items-center justify-center">
        <img src="/assets/icons/pair.svg" alt="scan_qr" className="mt-12" />
        <p className="mt-4 text-sm text-[#BBC1C7]">{t('this_device_is_the')}</p>
        <p className="mt-2 text-xl font-bold text-white">
          {t('pairing_device')}
        </p>
        <button
          className="text-lg rounded-full w-full font-bold py-2 mt-12 text-sm text-btn-primary bg-secondary"
          onClick={() => {}}
        >
          {t('scan_qr')}
        </button>
      </div>
    </div>
  );
};

export default KeygenInitial;
