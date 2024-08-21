import React, { useEffect, useState } from 'react';
import { GetVaults } from '../../../wailsjs/go/storage/Store';
import { storage } from '../../../wailsjs/go/models';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface VaultListProps {
  onSelectVault: (vault: storage.Vault) => void;
}

const VaultList: React.FC<VaultListProps> = ({ onSelectVault }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [vaults, setVaults] = useState<storage.Vault[]>([]);

  useEffect(() => {
    async function getVaultList() {
      try {
        const vaults = await GetVaults();
        setVaults(vaults);

        // Automatically select the first vault if there's only one
        if (vaults.length === 1) {
          onSelectVault(vaults[0]);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getVaultList();
  }, [onSelectVault]);

  const handleVaultSelect = (vault: storage.Vault) => {
    onSelectVault(vault);
  };

  return (
    <div className="relative">
      <div
        className={`absolute pt-12 top-full left-0 w-full h-screen bg-gray-900 text-white transition-transform duration-500 ease-in-out transform overflow-y-auto z-40`}
      >
        <ul className="space-y-4 px-4 py-4 overflow-y-auto h-[90%]">
          {vaults &&
            vaults.map((vault, index) => (
              <li
                key={index}
                className="py-2 px-2 bg-btn-primary rounded-lg font-bold cursor-pointer"
              >
                <button
                  onClick={() => handleVaultSelect(vault)}
                  className="no-underline text-white w-full items-center flex justify-between"
                >
                  <div>{vault.name}</div>
                  <img
                    src="/assets/icons/chevron-right.svg"
                    alt="details"
                    className="w-[15px]"
                  />
                </button>
              </li>
            ))}
        </ul>
        <button
          onClick={() => {
            navigate('/vault/setup');
          }}
          className="absolute bottom-5 w-full bg-secondary font-bold text-btn-primary px-5 py-2 rounded-3xl flex items-center justify-center "
        >
          <img src="/assets/icons/plus.svg" alt="add" className="w-[15px]" />
          <span className="px-2">{t('add_new_vault')}</span>
        </button>
      </div>
    </div>
  );
};

export default VaultList;
