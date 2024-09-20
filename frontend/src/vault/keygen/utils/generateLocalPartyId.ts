import { generateRandomNumber } from '../../../utils/util';

export const generateLocalPartyId = () =>
  ['windows', generateRandomNumber()].join('-');
