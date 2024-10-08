import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { makeAppPath } from '../../navigation';

const KeygenBackupNow: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center text-white pt-[10vh]">
      <img
        className="mx-auto mb-16"
        src="/assets/images/logoWithTitle.svg"
        alt="logoWithTitle"
      />
      <img
        className="mx-auto mb-8 h-[220px]"
        src="/assets/images/backupNow.svg"
        alt="backup"
      />
      <h2 className="text-sm w-80 mb-8">{t('backupnow_description')}</h2>
      <h2 className="text-sm w-80">{t('backupnow_note')}</h2>
      <div className="flex justify-center mt-28">
        <button
          className="bg-secondary text-btn-primary mr-20 rounded-full w-[250px] font-bold"
          onClick={() => {
            navigate(''); // update later: go to backup view
          }}
        >
          {t('backup')}
        </button>
        <button
          className="text-secondary border border-secondary border-solid py-2 px-4 rounded-full w-[250px] font-bold"
          onClick={() => {
            navigate(makeAppPath('vaultBackup'));
          }}
        >
          {t('skip')}
        </button>
      </div>
    </div>
  );
};

export default KeygenBackupNow;
