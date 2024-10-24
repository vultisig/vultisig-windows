import { capitalizeFirstLetter } from '../../../lib/utils/capitalizeFirstLetter';
import { randomIntegerInRange } from '../../../lib/utils/randomInRange';

export const keygenDevices = [
  'windows',
  'mac',
  'linux',
  'iphone',
  'ipad',
  'android',
  'server',
] as const;
export type KeygenDevice = (typeof keygenDevices)[number];

const localPartyIdSeparator = '-';

export const currentKeygenDevice: KeygenDevice = 'windows';

export const generateLocalPartyId = (
  device: KeygenDevice = currentKeygenDevice
) => {
  const deviceName =
    device === 'server' ? capitalizeFirstLetter(device) : device;

  const number =
    device === 'server'
      ? randomIntegerInRange(1000, 9999)
      : randomIntegerInRange(100, 999);

  return [deviceName, number].join(localPartyIdSeparator);
};

export const parseLocalPartyId = (localPartyId: string) => {
  const [deviceName, hash] = localPartyId.split(localPartyIdSeparator);

  return { deviceName, hash };
};

const keygenDeviceName: Record<KeygenDevice, string> = {
  windows: 'Windows',
  mac: 'Mac',
  linux: 'Linux',
  iphone: 'iPhone',
  ipad: 'iPad',
  android: 'Android',
  server: 'Server',
};

export const formatKeygenDeviceName = (deviceName: string) => {
  const lowerCaseDeviceName = deviceName.toLowerCase();
  if (lowerCaseDeviceName in keygenDeviceType) {
    return keygenDeviceName[lowerCaseDeviceName as KeygenDevice];
  }

  return deviceName;
};

export const deviceTypes = ['phone', 'tablet', 'desktop', 'server'] as const;
export type DeviceType = (typeof deviceTypes)[number];

const keygenDeviceType: Record<KeygenDevice, DeviceType> = {
  windows: 'desktop',
  mac: 'desktop',
  linux: 'desktop',
  iphone: 'phone',
  ipad: 'tablet',
  android: 'phone',
  server: 'server',
};

export const getKeygenDeviceType = (deviceName: string): DeviceType => {
  const lowerCaseDeviceName = deviceName.toLowerCase();
  if (lowerCaseDeviceName in keygenDeviceType) {
    return keygenDeviceType[lowerCaseDeviceName as KeygenDevice];
  }

  return 'phone';
};
