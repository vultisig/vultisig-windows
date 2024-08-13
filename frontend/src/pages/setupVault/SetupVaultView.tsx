import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from '../../components/navbar/NavBar';
import KeygenDone from '../../components/keygen/KeygenDone';
import KeygenError from '../../components/keygen/KeygenError';
import KeygenVerify from '../../components/keygen/KeygenVerify';
import KeygenNameVault from '../../components/keygen/KeygenNameVault';
import KeygenTypeSelector from '../../components/keygen/KeygenTypeSelector';
import KeygenInitial from '../../components/keygen/KeygenInitial';
import KeygenBackupNow from '../../components/keygen/KeygenBackupNow';
import KeygenView from '../../components/keygen/KeygenView';

const TabbedContent: React.FC = () => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<number>(4);
  const [vaultName, setVaultName] = useState<string>(t('main_vault'));
  const [devices, setDevices] = useState<string[]>([]);
  const [localPartyId, setLocalPartyId] = useState<string>('');
  const [keygenError, setKeygenError] = useState<string>('');

  useEffect(() => {
    setDevices([]);
    setLocalPartyId('');
    setKeygenError('');
    console.log(vaultName);
  }, []);

  const prevScreen = () => {
    setCurrentScreen(prev => {
      if (prev > 5) {
        return 4;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  };

  // screens
  // 0 - vault setup initial view
  // 1 - vault setup view
  // 2 - vault name setup
  // 3 - keygen peer discovery screens
  // 4 - keygen verify
  // 5 - keygen view
  // 6 - keygen done
  // 7 - keygen error
  // 8 - backup view

  const screens = [
    {
      title: t('setup'),
      content: <KeygenInitial onContinue={() => setCurrentScreen(1)} />,
    },
    {
      title: t('setup'),
      content: <KeygenTypeSelector onContinue={() => setCurrentScreen(2)} />,
    },
    {
      title: t('name_your_vault'),
      content: (
        <KeygenNameVault
          onContinue={vaultName => {
            setVaultName(vaultName);
            setCurrentScreen(3);
          }}
        />
      ),
    },
    {
      title: t('setup'), // need to be updated
      content: <></>, // keygen peer discovery view
    },
    {
      title: t('keygen'),
      content: (
        <KeygenVerify
          localPartyId={localPartyId}
          devices={devices}
          onContinue={() => setCurrentScreen(5)}
        />
      ),
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: <KeygenView />,
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: <KeygenDone />,
    },
    {
      title: t('keygen'),
      content: (
        <KeygenError
          keygenError={keygenError}
          onTryAgain={() => setCurrentScreen(4)}
        />
      ),
    },
    {
      title: '',
      content: <KeygenBackupNow />,
    },
  ];

  return (
    <>
      {screens[currentScreen].title && (
        <NavBar
          title={screens[currentScreen].title}
          questionLink={
            currentScreen === 5
              ? 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault'
              : undefined
          }
          handleBack={currentScreen !== 0 ? prevScreen : undefined}
        />
      )}
      {screens[currentScreen].content}
    </>
  );
};

export default TabbedContent;
