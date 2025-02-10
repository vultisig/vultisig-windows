import { NativeModule, requireNativeModule } from 'expo';

import { MobileTssModuleEvents } from './MobileTss.types';

declare class MobileTssModule extends NativeModule<MobileTssModuleEvents> {
  getDerivedPublicKey(hexPublicKey: string,hexChainCode: string, derivePath: string): string;
  keygen(name: string, localPartyID: string, sessionID: string, hexChainCode: string, hexEncryptionKey: string, serverURL: string): Promise<{[key: string]: any}>;
  keysign(data: { publicKey: string; keyShares: { [key: string]: string }; messages: string[]; localPartyID: string; derivePath: string; sessionID: string; hexEncryptionKey: string; serverURL: string; tssType: string }): Promise<{ [key: string]: any }>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MobileTssModule>('MobileTss');
