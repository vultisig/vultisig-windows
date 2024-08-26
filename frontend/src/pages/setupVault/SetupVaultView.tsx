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
import { KeygenType } from '../../model/TssType';
import { generateRandomNumber } from '../../utils/util';
import { ENDPOINTS } from '../../utils/config';
import { storage } from '../../../wailsjs/go/models';

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
  const [serverURL, setServerURL] = useState<string>('http://localhost:18080');
  const vault = useRef<storage.Vault>(new storage.Vault());
  const keygenType = useRef<KeygenType>(KeygenType.Keygen);

  useEffect(() => {
    setKeygenError('');

    // when current vault's local party is empty , means it is a new vault
    if (vault.current.local_party_id === '') {
      // new vault
      vault.current.local_party_id = 'windows-' + generateRandomNumber();
    }
    setLocalPartyId(vault.current.local_party_id);
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

  const onKeygenPeerDiscoveryContinue = (
    isRelay: boolean,
    sessionID: string,
    devices: string[],
    hexEncryptionKey: string,
    hexChainCode: string
  ) => {
    setIsRelay(isRelay);
    setServerURL(
      isRelay ? ENDPOINTS.VULTISIG_RELAY : ENDPOINTS.LOCAL_MEDIATOR_URL
    );
    setSessionID(sessionID);

    devices.push(localPartyId);
    setDevices(devices);
    setHexEncryptionKey(hexEncryptionKey);
    vault.current.local_party_id = localPartyId;
    vault.current.name = vaultName;
    vault.current.signers = devices;
    vault.current.hex_chain_code = hexChainCode;
    setCurrentScreen(4);
  };

  const keygenStart = async () => {
    await startkeygen(isRelay, sessionID!, devices).then(() => {
      setCurrentScreen(5);
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
          vault={vault.current}
          sessionID={sessionID!}
          hexEncryptionKey={hexEncryptionKey}
          keygenType={keygenType.current}
          serverURL={serverURL}
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
