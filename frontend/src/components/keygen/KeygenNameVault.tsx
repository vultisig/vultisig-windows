import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface KeygenNameVaultProps {
  onContinue: (vaultName: string) => void;
}

const KeygenNameVault: React.FC<KeygenNameVaultProps> = ({ onContinue }) => {
  const { t } = useTranslation();
  const [vaultName, setVaultName] = useState<string>('');

  return (
    <div className="text-white flex flex-col items-center justify-center mt-60">
      <div>
        <label htmlFor="input" className="block text-md mb-2">
          {t('vault_name')}
        </label>
        <input
          id="input"
          type="text"
          value={vaultName}
          onChange={e => {
            setVaultName(e.target.value);
          }}
          className="font-bold bg-white/[.10] rounded-lg w-80 py-2 px-3"
        />
      </div>
      <button
        className={`text-lg rounded-full w-80 font-bold py-2 mt-16 ${
          vaultName
            ? 'text-btn-primary bg-secondary'
            : 'text-btn-secondary bg-white/[.10]'
        }`}
        disabled={vaultName === ''}
        onClick={() => onContinue(vaultName)}
      >
        {t('continue')}
      </button>
    </div>
  );
};

export default KeygenNameVault;
