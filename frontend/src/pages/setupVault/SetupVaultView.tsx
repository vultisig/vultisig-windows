import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { storage } from '../../../wailsjs/go/models';
import KeygenBackupNow from '../../components/keygen/KeygenBackupNow';
import KeygenDone from '../../components/keygen/KeygenDone';
import KeygenVerify from '../../components/keygen/KeygenVerify';
import KeygenView from '../../components/keygen/KeygenView';
import NavBar from '../../components/navbar/NavBar';
import { ComponentWithBackActionProps } from '../../lib/ui/props';
import { startSession } from '../../services/Keygen/Keygen';
import { keygenServerUrl } from '../../vault/keygen/KeygenServerType';
import { KeygenType } from '../../vault/keygen/KeygenType';
import { KeygenFailedState } from '../../vault/keygen/shared/KeygenFailedState';
import { useCurrentLocalPartyId } from '../../vault/keygen/state/currentLocalPartyId';
import { useCurrentServerType } from '../../vault/keygen/state/currentServerType';
import { useVaultKeygenDevices } from '../../vault/setup/hooks/useVaultKegenDevices';
import { useCurrentHexChainCode } from '../../vault/setup/state/currentHexChainCode';
import { useCurrentHexEncryptionKey } from '../../vault/setup/state/currentHexEncryptionKey';
import { useCurrentSessionId } from '../../vault/setup/state/currentSessionId';
import { useVaultName } from '../../vault/setup/state/vaultName';

export const SetupVaultView = ({ onBack }: ComponentWithBackActionProps) => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const sessionId = useCurrentSessionId();
  const [keygenError, setKeygenError] = useState<string>('');
  const hexChainCode = useCurrentHexChainCode();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const [serverType] = useCurrentServerType();
  const devices = useVaultKeygenDevices();
  const localPartyId = useCurrentLocalPartyId();
  const [vaultName] = useVaultName();

  const vault = useMemo(() => {
    const result = new storage.Vault();
    result.local_party_id = localPartyId;
    result.name = vaultName;
    result.signers = devices;
    result.hex_chain_code = hexChainCode;

    return result;
  }, [devices, hexChainCode, localPartyId, vaultName]);

  const prevScreen = () => {
    setCurrentScreen(prev => {
      if (prev > 1) {
        return 0;
      } else {
        return prev - 1;
      }
    });
  };

  const serverUrl = keygenServerUrl[serverType];

  const keygenStart = async () => {
    await startSession(serverUrl, sessionId, devices).then(() => {
      setCurrentScreen(1);
    });
  };

  // screens
  // 0 - keygen verify
  // 1 - keygen view
  // 2 - keygen done
  // 3 - keygen error
  // 4 - backup view
  const screens = [
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
          vault={vault}
          sessionID={sessionId}
          hexEncryptionKey={hexEncryptionKey}
          keygenType={KeygenType.Keygen}
          serverURL={serverUrl}
          onDone={() => {
            setCurrentScreen(2);
          }}
          onError={(err: string) => {
            setKeygenError(err);
            setCurrentScreen(3);
          }}
        />
      ),
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: (
        <KeygenDone
          onNext={() => {
            setCurrentScreen(4);
          }}
        />
      ),
    },
    {
      title: t('keygen'),
      content: (
        <KeygenFailedState
          message={keygenError}
          onTryAgain={() => setCurrentScreen(0)}
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
            currentScreen === 4
              ? 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault'
              : undefined
          }
          handleBack={currentScreen == 0 ? onBack : prevScreen}
        />
      )}
      {screens[currentScreen].content}
    </>
  );
};
