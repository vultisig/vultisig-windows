import WAValidator from 'multicoin-address-validator';

export const isValidAddress = (address: string, coinSymbol: string) => {
  // The 'coinSymbol' is the symbol of the cryptocurrency (e.g., 'ETH', 'BTC')
  return WAValidator.validate(address, coinSymbol);
};
