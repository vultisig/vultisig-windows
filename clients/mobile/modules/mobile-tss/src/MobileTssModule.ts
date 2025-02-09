import { NativeModule, requireNativeModule } from 'expo';

import { MobileTssModuleEvents } from './MobileTss.types';

declare class MobileTssModule extends NativeModule<MobileTssModuleEvents> {
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MobileTssModule>('MobileTss');
