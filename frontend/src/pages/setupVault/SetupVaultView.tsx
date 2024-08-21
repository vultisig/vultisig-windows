import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from '../../components/navbar/NavBar';
import KeygenError from '../../components/keygen/KeygenError';
import KeygenNameVault from '../../components/keygen/KeygenNameVault';
import KeygenBackupNow from '../../components/keygen/KeygenBackupNow';
import KeygenView from '../../components/keygen/KeygenView';
import KeygenDone from '../../components/keygen/KeygenDone';
import KeygenInitial from '../../components/keygen/KeygenInitial';
import KeygenTypeSelector from '../../components/keygen/KeygenTypeSelector';
import KeygenVerify from '../../components/keygen/KeygenVerify';
import KeygenPeerDiscovery from '../../components/keygen/KeygenPeerDiscovery';
import { startkeygen } from '../../services/Keygen/Keygen';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import { KeygenType } from '../../model/TssType';

const SetupVaultView: React.FC = () => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [vaultName, setVaultName] = useState<string>(t('main_vault'));
  const [sessionID, setSessionID] = useState<string>();
  const [devices, setDevices] = useState<string[]>([]);
  const [localPartyId, setLocalPartyId] = useState<string>('');
  const [keygenError, setKeygenError] = useState<string>('');
  const [vaultType, setVaultType] = useState<string>('2/2');
  const [isRelay, setIsRelay] = useState(true);
  const [hexEncryptionKey, setHexEncryptionKey] = useState<string>('');
  const vault = useRef<Vault>(new Vault());
  const keygenType = useRef<KeygenType>(KeygenType.Keygen);

  useEffect(() => {
    setKeygenError('');
    console.log(sessionID);
  }, []);

  useEffect(() => {
    if (isRelay) {
      // need to start local mediator
    }
  }, [isRelay]);

  const prevScreen = () => {
    setCurrentScreen(prev => {
      if (prev > 5) {
        return 4;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  };

  const onKeygenPeerDiscoveryContinue = (
    isRelay: boolean,
    sessionID: string,
    serviceName: string,
    devices: string[],
    hexEncryptionKey: string,
    hexChainCode: string
  ) => {
    setIsRelay(isRelay);
    setSessionID(sessionID);
    setLocalPartyId(serviceName);
    devices.push(serviceName);
    setDevices(devices);
    setHexEncryptionKey(hexEncryptionKey);
    vault.current.localPartyId = localPartyId;
    vault.current.name = vaultName;
    vault.current.signers = devices;
    vault.current.hexChainCode = hexChainCode;
    setCurrentScreen(4);
  };

  const keygenStart = async () => {
    setCurrentScreen(5);
    await startkeygen(isRelay, localPartyId, devices);
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
      content: (
        <KeygenTypeSelector
          setVaultType={setVaultType}
          onContinue={() => setCurrentScreen(2)}
        />
      ),
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
      title: `${t('keygen_for')} ${vaultType} ${t('vault')}`,
      content: (
        <KeygenPeerDiscovery
          vaultName={vaultName}
          vaultType={vaultType}
          onContinue={onKeygenPeerDiscoveryContinue}
        />
      ),
    },
    {
      title: t('keygen'),
      content: (
        <KeygenVerify
          localPartyId={localPartyId}
          devices={devices}
          onContinue={keygenStart}
        />
      ),
    },
    {
      title: `${t('keygen')}`,
      content: (
        <KeygenView
          isRelay={isRelay}
          vault={vault.current}
          sessionID={sessionID!}
          devices={devices}
          hexEncryptionKey={hexEncryptionKey}
          keygenType={keygenType.current}
          onDone={() => {
            setCurrentScreen(6);
          }}
          onError={(err: string) => {
            setKeygenError(err);
            setCurrentScreen(7);
          }}
        />
      ),
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: (
        <KeygenDone
          onNext={() => {
            setCurrentScreen(8);
          }}
        />
      ),
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

export default SetupVaultView;
