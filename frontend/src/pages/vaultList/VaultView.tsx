import React, { useEffect } from 'react';
//import { GetVaults } from '../../../wailsjs/go/storage/Store';
//import { storage } from '../../../wailsjs/go/models';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import VaultList from '../../components/vaultList/VaultList';

const VaultView: React.FC = () => {
  // const navigate = useNavigate();
  // const { t } = useTranslation();

  useEffect(() => {
    async function getVaultList() {}
    getVaultList();
  }, []);

  return (
    <div className="relative">
      <VaultList />
    </div>
  );
};

export default VaultView;
