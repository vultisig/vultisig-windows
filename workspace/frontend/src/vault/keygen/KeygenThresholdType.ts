export const keygenThresholdTypes = ['2/2', '2/3', 'm/n'] as const;
export type KeygenThresholdType = (typeof keygenThresholdTypes)[number];

export const defaultKeygenThresholdType = keygenThresholdTypes[0];
