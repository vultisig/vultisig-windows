import { GetDerivedPubKey } from '../../wailsjs/go/tss/TssService';
class PublicKeyHelper {
  static async getDerivedPubKey(
    hexPubKey: string,
    hexChainCode: string,
    derivePath: string
  ): Promise<string> {
    return GetDerivedPubKey(hexPubKey, hexChainCode, derivePath, false);
  }
}
export default PublicKeyHelper;
