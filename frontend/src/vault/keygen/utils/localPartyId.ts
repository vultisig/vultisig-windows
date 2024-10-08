import { generateRandomNumber } from '../../../utils/util';

export const keygenDevices = [
  'windows',
  'mac',
  'linux',
  'iphone',
  'ipad',
  'android',
] as const;
export type KeygenDevice = (typeof keygenDevices)[number];

const localPartyIdSeparator = '-';

export const currentKeygenDevice: KeygenDevice = 'windows';

export const generateLocalPartyId = () =>
  [currentKeygenDevice, generateRandomNumber()].join(localPartyIdSeparator);

export const parseLocalPartyId = (localPartyId: string) => {
  const [id, hash] = localPartyId.split(localPartyIdSeparator);

  return { id, hash };
};

const keygenDeviceName: Record<KeygenDevice, string> = {
  windows: 'Windows',
  mac: 'Mac',
  linux: 'Linux',
  iphone: 'iPhone',
  ipad: 'iPad',
  android: 'Android',
};

export const getKeygenDeviceName = (id: string) => {
  if (id in keygenDeviceName) {
    return keygenDeviceName[id as KeygenDevice];
  }

  return id;
};

export const deviceTypes = ['phone', 'tablet', 'desktop'] as const;
export type DeviceType = (typeof deviceTypes)[number];

const keygenDeviceType: Record<KeygenDevice, DeviceType> = {
  windows: 'desktop',
  mac: 'desktop',
  linux: 'desktop',
  iphone: 'phone',
  ipad: 'tablet',
  android: 'phone',
};

export const getKeygenDeviceType = (id: string): DeviceType => {
  if (id in keygenDeviceType) {
    return keygenDeviceType[id as KeygenDevice];
  }

  return 'phone';
};
