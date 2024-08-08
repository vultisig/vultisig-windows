import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from '../../components/navbar/NavBar';
import KeygenPeerDiscoveryView from '../keygenPeerDiscovery/KeygenPeerDiscoveryView';

interface TabContent {
  title: string;
  type: string;
  description1: string;
  description2: string;
  description3: string;
  image: string;
}

const TabbedContent: React.FC = () => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [vaultName, setVaultName] = useState<string>(t('main_vault'));
  const [vaultType, setVaultType] = useState<string>('2/3');
  const [devices, setDevices] = useState<string[]>([]);
  const [localPartyId, setLocalPartyId] = useState<string>('');
  const [keygenError, setKeygenError] = useState<string>('');

  useEffect(() => {
    setDevices([]);
    setLocalPartyId('');
    setKeygenError('');
  }, []);

  const prevScreen = () => {
    setCurrentScreen(prev => {
      if (prev > 4) {
        return 3;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  };

  const tabs: TabContent[] = [
    {
      title: t('2_of_2_vault'),
      type: '2/2',
      description1: `${t('need_min_devices')} 2 ${t('devices')}`,
      description2: `1. ${t('start_from_one_device')}`,
      description3: `2. ${t('pair_from_the')} ${t('second')} ${t('device')}`,
      image: '/assets/images/vaultSetup1.svg',
    },
    {
      title: t('2_of_3_vault'),
      type: '2/3',
      description1: `${t('need_min_devices')} 3 ${t('devices')}`,
      description2: `1. ${t('start_from_one_device')}`,
      description3: `2. ${t('pair_from_the')} ${t('second_and_third')} ${t(
        'device'
      )}`,
      image: '/assets/images/vaultSetup2.svg',
    },
    {
      title: t('m_of_n_vault'),
      type: 'm/n',
      description1: t('m_of_n_vault'),
      description2: `1. ${t('start_from_one_device')}`,
      description3: `2. ${t('pair_from_the')} ${t('other')} ${t('device')}`,
      image: '/assets/images/vaultSetup3.svg',
    },
  ];

  const renderDevicesList = () => {
    let pairDeviceCount = Math.ceil((2 * devices.length) / 3);
    return devices.map((device, index) => {
      pairDeviceCount = pairDeviceCount - (device === localPartyId ? 0 : 1);
      const deviceState =
        device === localPartyId
          ? t('this_device')
          : pairDeviceCount > 0
            ? t('pair_device')
            : t('backup_device');
      return (
        <div
          key={device + index}
          className="w-full bg-btn-primary p-4 mb-2 rounded-2xl"
        >
          {index + 1}
          {'. '}
          {device}
          {' ('}
          {deviceState}
          {')'}
        </div>
      );
    });
  };

  // screens
  // 0 - vault setup view
  // 1 - vault name setup
  // 2 - keygen peer discovery screens
  // 3 - keygen verify
  // 4 - keygen view
  // 5 - keygen done
  // 6 - keygen error
  const screens = [
    {
      title: t('setup'),
      content: (
        <div className="text-white mx-auto max-w-4xl pt-8">
          <div className="flex justify-center space-x-4">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`py-2 px-4 border-b-2 ${
                  activeTab === index ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={() => {
                  setActiveTab(index);
                  setVaultType(tab.type);
                }}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="mb-8">
              {tabs[activeTab].description1}
              <br />
              {tabs[activeTab].description2}
              <br />
              {tabs[activeTab].description3}
            </p>
            <img
              src={tabs[activeTab].image}
              alt="vault_setup"
              className="mx-auto mb-4 w-60"
            />
            <img
              src="/assets/images/icons/wifi.svg"
              alt="wifi"
              className="mx-auto mb-4 w-8"
            />
            <p className="mb-4">{t('devices_on_same_wifi')}</p>
          </div>
          <div className="flex justify-center mt-12">
            <button
              className="bg-secondary text-btn-primary mr-20 rounded-full w-[250px] font-bold"
              onClick={() => {
                setCurrentScreen(1);
              }}
            >
              {t('start')}
            </button>
            <button
              className="text-secondary border border-secondary border-solid py-2 px-4 rounded-full w-[250px] font-bold"
              onClick={() => {}}
            >
              {t('pair')}
            </button>
          </div>
        </div>
      ),
    },
    {
      title: t('name_your_vault'),
      content: (
        <div className="text-white flex flex-col items-center justify-center mt-60">
          <div>
            <label htmlFor="input" className="block text-md mb-2">
              {t('vault_name')}
            </label>
            <input
              id="input"
              type="text"
              value={vaultName}
              onChange={e => {
                setVaultName(e.target.value);
              }}
              className="font-bold bg-white/[.10] rounded-lg w-80 py-2 px-3"
            />
          </div>
          <button
            className={`text-lg rounded-full w-80 font-bold py-2 mt-16 ${
              vaultName
                ? 'text-btn-primary bg-secondary'
                : 'text-btn-secondary bg-white/[.10]'
            }`}
            disabled={vaultName === ''}
            onClick={() => {
              setCurrentScreen(2);
            }}
          >
            {t('continue')}
          </button>
        </div>
      ),
    },
    {
      title: `${t('keygen_for')} ${vaultType} ${t('vault')}`,
      content: (
        <>
          <KeygenPeerDiscoveryView
            vaultName={vaultName}
            vaultType={vaultType}
          />
        </>
      ),
    },
    {
      title: t('keygen'),
      content: (
        <div className="text-white text-sm flex flex-col items-center justify-center">
          <div className="mt-8 text-lg mb-2">
            {Math.ceil((2 * devices.length) / 3)}
            {' of '}
            {devices.length} {t('vault')}
          </div>
          <div className="flex flex-col items-center justify-center w-80">
            <div className="mb-8">{t('with_these_devices')}</div>
            {renderDevicesList()}
          </div>
          <div className="w-80 flex mt-2 px-3 py-2 border border-secondary/[.5] rounded-2xl">
            <img src="/assets/images/icons/info.svg" alt="info" />
            <p className="ml-2">
              {t('pair_device_disclaimers_first')}{' '}
              {Math.ceil((2 * devices.length) / 3)}{' '}
              {t('pair_device_disclaimers_second')}
            </p>
          </div>
          <div className="w-80 flex mt-2 px-3 py-2 border border-secondary/[.5] rounded-2xl">
            <img src="/assets/images/icons/info.svg" alt="info" />
            <p className="ml-2">
              {devices.length > 2
                ? t('backup_not_needed_disclaimer')
                : t('no_backup_device_disclaimer')}
            </p>
          </div>
          <button
            className="fixed bottom-16 text-lg rounded-full w-80 font-bold py-2 text-btn-primary bg-secondary"
            onClick={() => {
              setCurrentScreen(4);
            }}
          >
            {t('continue')}
          </button>
        </div>
      ),
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: <></>, // keygen view
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: (
        <div className="text-center text-white">
          <img
            src="/assets/images/icons/done.svg"
            alt="done"
            className="mx-auto mt-[30vh] mb-6"
          />
          <p className="text-2xl font-bold">{t('done')}</p>
          <div className="w-full fixed bottom-16 text-center">
            <img
              src="/assets/images/icons/wifi.svg"
              alt="wifi"
              className="mx-auto mb-4 w-8"
            />
            <p className="mb-4">{t('devices_on_same_wifi')}</p>
          </div>
        </div>
      ),
    },
    {
      title: t('keygen'), // need to be updated
      content: (
        <div className="text-center text-white">
          <img
            src="/assets/images/warningYellow.svg"
            alt="warning"
            className="mx-auto mt-[25vh] mb-6"
          />
          <p className="text-2xl font-bold">
            {t('keygen_failed')}
            <br />
            {keygenError && (
              <p className="text-sm font-normal mt-2">{keygenError}</p>
            )}
          </p>
          <div className="w-full fixed bottom-16 text-sm">
            <div className="w-[330px] mx-auto">
              <div className="w-full flex mb-4 px-3 py-2 border border-warning bg-warning/[.35] rounded-2xl">
                <img src="/assets/images/warning.svg" alt="warning" />
                <p className="ml-2 text-left">
                  {t('information_note1')}
                  <br />
                  {t('information_note2')}
                </p>
              </div>
              <button
                className="text-lg rounded-full w-full font-bold py-2 text-btn-primary bg-secondary"
                onClick={() => {
                  setCurrentScreen(3);
                }}
              >
                {t('try_again')}
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <NavBar
        title={screens[currentScreen].title}
        questionLink={
          currentScreen === 0 || currentScreen > 3
            ? 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault'
            : undefined
        }
        handleBack={currentScreen !== 0 ? prevScreen : undefined}
      />
      {screens[currentScreen].content}
    </>
  );
};

export default TabbedContent;
