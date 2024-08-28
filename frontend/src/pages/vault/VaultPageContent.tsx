import React, { useState } from 'react';
import { VaultList } from '../../components/vaultList/VaultList';
import useVaultListViewModel from './VaultListViewModel';
import { useWalletCore } from '../../main';
import { VaultBalances } from './VaultBalances';
import { useCurrentVault } from '../../vault/components/CurrentVaultProvider';
import { Match } from '../../lib/ui/base/Match';
import { useTranslation } from 'react-i18next';
import { match } from '../../lib/utils/match';

type VaultPageView = 'balances' | 'vaults';

export const VaultPageContent: React.FC = () => {
  const walletCore = useWalletCore();
  const [selectedVault] = useCurrentVault();
  const { coins, balances, priceRates } = useVaultListViewModel(walletCore);

  const [view, setView] = useState<VaultPageView>('balances');

  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col">
      <button
        onClick={() => {
          setView(view === 'balances' ? 'vaults' : 'balances');
        }}
        className="px-4 py-4 bg-primary font-bold text-white w-full flex items-center justify-center sticky top-0 z-10"
      >
        {match(view, {
          balances: () => selectedVault.name,
          vaults: () => t('vaults'),
        })}
        <img
          src="/assets/icons/chevron-down.svg"
          alt="open"
          className={`ml-2 transition-transform w-[15px] duration-300 ${view === 'vaults' ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>
      <div className="flex-1 flex flex-col">
        <Match
          value={view}
          balances={() => (
            <VaultBalances
              coins={coins}
              balances={balances}
              priceRates={priceRates}
            />
          )}
          vaults={() => (
            <VaultList
              onFinish={() => {
                setView('balances');
              }}
            />
          )}
        />
      </div>
    </div>
  );
};
