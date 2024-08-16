export interface IAddressService {
  resolveDomainAddress(address: string): Promise<string>;
  validateAddress(address: string): Promise<boolean>; // Each chain validates different things, so this method should be implemented in each service

  getPublicKey(publicKeyECDSA: string, publicKeyEdDSA: string): Promise<any>;

  getDerivedPubKey(
    hexPubKey: string,
    hexChainCode: string,
    derivePath: string
  ): Promise<string>;

  deriveAddressFromPublicKey(
    publicKeyECDSA: string,
    publicKeyEdDSA: string
  ): Promise<string>;
}
