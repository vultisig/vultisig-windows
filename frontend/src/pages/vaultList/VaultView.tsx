import React, { useEffect, useState } from 'react';
import VaultList from '../../components/vaultList/VaultList';
import { storage } from '../../../wailsjs/go/models';

const VaultView: React.FC = () => {
  const [selectedVault, setSelectedVault] = useState<storage.Vault | null>(
    null
  );

  useEffect(() => {
    if (selectedVault) {
      console.log('Selected vault:', selectedVault);
    }
  }, [selectedVault]);

  return (
    <div className="relative">
      <VaultList onSelectVault={setSelectedVault} />
      {/* You can use selectedVault to render additional details here */}
    </div>
  );
};

export default VaultView;
