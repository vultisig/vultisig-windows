import React, { useEffect, useState } from 'react';
import { GetVaults } from '../../../wailsjs/go/storage/Store';
import { storage } from '../../../wailsjs/go/models';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const VaultList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [vaults, setVaults] = useState<storage.Vault[]>([]);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    async function getVaultList() {
      try {
        const vaults = await GetVaults();
        console.log(vaults);
        setVaults(vaults);
      } catch (error) {
        console.error(error);
      }
    }
    getVaultList();
  }, []);
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="px-4 py-4 bg-primary font-bold text-white w-full fixed top-0 z-50 flex items-center justify-center"
      >
        {t('vaults')}
        <img
          src="/assets/icons/chevron-down.svg"
          alt="open"
          className={`ml-2  transition-transform w-[15px] duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      <div
        className={`absolute pt-12  top-full left-0 w-full h-screen bg-gray-900 text-white transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-y-0' : '-translate-y-full'} overflow-y-auto z-40`}
      >
        <ul className="space-y-4 px-4 py-4 overflow-y-auto h-[90%]">
          {vaults &&
            vaults.map((vault, index) => (
              <li
                key={index}
                className="py-2 px-2 bg-btn-primary rounded-lg  font-bold cursor-pointer"
              >
                <button
                  onClick={() => {
                    /**
                  @todo: Vault details
                  **/
                  }}
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
          className="absolute bottom-5 w-full bg-btn-tertiary font-bold text-btn-primary px-5 py-2 rounded-3xl flex items-center justify-center "
        >
          <img src="/assets/icons/plus.svg" alt="add" className="w-[15px]" />
          <span className="px-2">{t('add_new_vault')}</span>
        </button>
      </div>
    </div>
  );
};

export default VaultList;
