import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './MobileTss.types';

type MobileTssModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class MobileTssModule extends NativeModule<MobileTssModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(MobileTssModule);
