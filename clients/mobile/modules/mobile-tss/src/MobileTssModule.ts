import { NativeModule, requireNativeModule } from 'expo';

import { MobileTssModuleEvents } from './MobileTss.types';

declare class MobileTssModule extends NativeModule<MobileTssModuleEvents> {
  getDerivedPublicKey(hexPublicKey: string,hexChainCode: string, derivePath: string): string;
  keygen(): Promise<string>;
  keysign(): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MobileTssModule>('MobileTss');
