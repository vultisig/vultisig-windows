import React from 'react';
import { useTranslation } from 'react-i18next';

interface KeygenVerifyProps {
  localPartyId: string;
  devices: string[];
  onContinue: () => void;
}

const KeygenVerify: React.FC<KeygenVerifyProps> = ({
  localPartyId,
  devices,
  onContinue,
}) => {
  const { t } = useTranslation();

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

  return (
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
        <img src="/assets/images/info.svg" alt="info" />
        <p className="ml-2">
          {t('pair_device_disclaimers_first')}{' '}
          {Math.ceil((2 * devices.length) / 3)}{' '}
          {t('pair_device_disclaimers_second')}
        </p>
      </div>
      <div className="w-80 flex mt-2 px-3 py-2 border border-secondary/[.5] rounded-2xl">
        <img src="/assets/images/info.svg" alt="info" />
        <p className="ml-2">{t('backup_disclaimer')}</p>
      </div>
      <button
        className="fixed bottom-16 text-lg rounded-full w-80 font-bold py-2 text-btn-primary bg-secondary"
        onClick={onContinue}
      >
        {t('continue')}
      </button>
    </div>
  );
};

export default KeygenVerify;
