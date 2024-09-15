import React from 'react';
import { useTranslation } from 'react-i18next';

import { DiscoveryService } from '../../../wailsjs/go/mediator/Server';

interface DiscoveryServiceProps {
  serviceName: string;
  localPartyID: string;
  onContinue: (url: string) => void;
}
const DiscoveryServiceScreen: React.FC<DiscoveryServiceProps> = ({
  serviceName,
  localPartyID,
  onContinue,
}) => {
  const { t } = useTranslation();
  const discoveryServerURL = async () => {
    return await DiscoveryService(serviceName);
  };
  discoveryServerURL().then(url => {
    onContinue(url);
  });
  return (
    <>
      <div className="text-center text-white">
        <p className="text-2xl font-bold">{t('discovering_mediator')}</p>
        <p className="text-2xl font-bold">{localPartyID}</p>
        <img
          src="/assets/icons/wifi.svg"
          alt="wifi"
          className="mx-auto mt-[30vh] mb-6"
        />
      </div>
    </>
  );
};

export default DiscoveryServiceScreen;
