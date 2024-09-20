import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { storage } from '../../../wailsjs/go/models';
import KeygenBackupNow from '../../components/keygen/KeygenBackupNow';
import KeygenDone from '../../components/keygen/KeygenDone';
import KeygenError from '../../components/keygen/KeygenError';
import KeygenView from '../../components/keygen/KeygenView';
import NavBar from '../../components/navbar/NavBar';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { makeAppPath } from '../../navigation';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { useCurrentJoinKeygenMsg } from '../../vault/keygen/state/currentJoinKeygenMsg';
import { useCurrentServerUrl } from '../../vault/keygen/state/currentServerUrl';
import { generateLocalPartyId } from '../../vault/keygen/utils/generateLocalPartyId';
import { useVaults } from '../../vault/queries/useVaultsQuery';

const JoinKeygenView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [keygenError, setKeygenError] = useState<string>('');

  const { keygenType } = useAppPathParams<'joinKeygen'>();

  const keygenMsg = useCurrentJoinKeygenMsg();

  const vaults = useVaults();

  const { sessionId, vaultName, hexChainCode, encryptionKeyHex } = keygenMsg;

  const localPartyId = useMemo(generateLocalPartyId, []);

  const vault = useMemo(() => {
    if ('publicKeyEcdsa' in keygenMsg) {
      const existingVault = vaults.find(
        vault => vault.public_key_ecdsa === keygenMsg.publicKeyEcdsa
      );
      if (existingVault) {
        return existingVault;
      }
    }

    const vault = new storage.Vault();
    vault.name = vaultName;
    vault.hex_chain_code = hexChainCode;
    vault.local_party_id = localPartyId;

    if ('oldResharePrefix' in keygenMsg) {
      vault.reshare_prefix = keygenMsg.oldResharePrefix;
    }

    if ('oldParties' in keygenMsg) {
      vault.signers = keygenMsg.oldParties;
    }

    return vault;
  }, [hexChainCode, keygenMsg, localPartyId, vaultName, vaults]);

  const serverUrl = useCurrentServerUrl();

  const [currentScreen, setCurrentScreen] = useState<number>(0);

  const prevScreen = () => {
    setCurrentScreen(prev => {
      if (prev > 3) {
        return 2;
      } else {
        return prev > 2 ? prev - 1 : prev;
      }
    });
  };

  const screens = [
    {
      title: `${t('keygen')}`,
      content: (
        <KeygenView
          vault={vault}
          sessionID={sessionId}
          hexEncryptionKey={encryptionKeyHex}
          keygenType={keygenType}
          serverURL={shouldBePresent(serverUrl)}
          onDone={() => {
            setCurrentScreen(1);
          }}
          onError={(err: string) => {
            setKeygenError(err);
            setCurrentScreen(2);
          }}
        />
      ),
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: (
        <KeygenDone
          onNext={() => {
            setCurrentScreen(3);
          }}
        />
      ),
    },
    {
      title: t('keygen'),
      content: (
        <KeygenError
          keygenError={keygenError}
          onTryAgain={() => {
            navigate(makeAppPath('vaultList'));
          }}
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
          questionLink={undefined}
          handleBack={currentScreen !== 0 ? prevScreen : undefined}
        />
      )}
      {screens[currentScreen].content}
    </>
  );
};
export default JoinKeygenView;
