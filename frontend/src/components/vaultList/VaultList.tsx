import React from 'react';
import { storage } from '../../../wailsjs/go/models';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrentVault } from '../../vault/components/CurrentVaultProvider';
import { useCurrentVaults } from '../../vault/components/CurrentVaultsProvider';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';

interface VaultListProps {
  onFinish: () => void;
}

export const VaultList: React.FC<VaultListProps> = ({ onFinish }) => {
  const [, setSelectedVault] = useCurrentVault();
  const vaults = useCurrentVaults();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleVaultSelect = (vault: storage.Vault) => {
    setSelectedVault(vault);
    onFinish();
  };

  return (
    <div className="flex flex-col flex-1 space-y-4">
      <ScrollableFlexboxFiller>
        <ul className="flex flex-col px-4 space-y-4">
          {vaults.map((vault, index) => (
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
      </ScrollableFlexboxFiller>
      <div className="px-4 w-full">
        <button
          onClick={() => {
            navigate('/vault/setup');
          }}
          className="w-full bg-btn-tertiary font-bold text-btn-primary px-5 py-2 rounded-3xl flex items-center justify-center"
        >
          <img src="/assets/icons/plus.svg" alt="add" className="w-[15px]" />
          <span className="px-2">{t('add_new_vault')}</span>
        </button>
      </div>
    </div>
  );
};
