/* eslint-disable */
import React, { useState } from 'react';
import VaultList from '../../components/vaultList/VaultList';
import useVaultListViewModel from './VaultListViewModel';
import { useWalletCore } from '../../main';
import { useTranslation } from 'react-i18next';
import { VaultBalances } from './VaultBalances';
import { useCurrentVault } from '../../vault/components/CurrentVaultProvider';

const VaultListView: React.FC = () => {
  const walletCore = useWalletCore();
  const [selectedVault, setSelectedVault] = useCurrentVault();
  const { coins, balances } = useVaultListViewModel(walletCore);

  const [isVaultListOpen, setIsVaultListOpen] = useState(false);

  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <button
        onClick={() => {
          setIsVaultListOpen(!isVaultListOpen);
        }}
        className="px-4 py-4 bg-primary font-bold text-white w-full flex items-center justify-center"
      >
        {selectedVault ? selectedVault.name : t('vaults')}
        <img
          src="/assets/icons/chevron-down.svg"
          alt="open"
          className={`ml-2 transition-transform w-[15px] duration-300 ${isVaultListOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>
      {selectedVault &&
        (isVaultListOpen ? (
          <VaultList onSelectVault={setSelectedVault} />
        ) : selectedVault ? (
          <VaultBalances coins={coins} balances={balances} />
        ) : null)}
    </div>
  );
};

export default VaultListView;
