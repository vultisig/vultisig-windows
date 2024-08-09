import React from 'react';
import { useTranslation } from 'react-i18next';

interface KeygenErrorProps {
  keygenError: string;
  onTryAgain: () => void;
}

const KeygenError: React.FC<KeygenErrorProps> = ({
  keygenError,
  onTryAgain,
}) => {
  const { t } = useTranslation();

  return (
    <div className="text-center text-white">
      <img
        src="/assets/images/warningYellow.svg"
        alt="warning"
        className="mx-auto mt-[25vh] mb-6"
      />
      <p className="text-2xl font-bold">
        {t('keygen_failed')}
        <br />
        {keygenError && (
          <p className="text-sm font-normal mt-2">{keygenError}</p>
        )}
      </p>
      <div className="w-full fixed bottom-16 text-sm">
        <div className="w-[330px] mx-auto">
          <div className="w-full flex mb-4 px-3 py-2 border border-warning bg-warning/[.35] rounded-2xl">
            <img src="/assets/images/warning.svg" alt="warning" />
            <p className="ml-2 text-left">
              {t('information_note1')}
              <br />
              {t('information_note2')}
            </p>
          </div>
          <button
            className="text-lg rounded-full w-full font-bold py-2 text-btn-primary bg-secondary"
            onClick={onTryAgain}
          >
            {t('try_again')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeygenError;
