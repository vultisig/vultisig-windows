import { requireNativeView } from 'expo';
import * as React from 'react';

import { MobileTssViewProps } from './MobileTss.types';

const NativeView: React.ComponentType<MobileTssViewProps> =
  requireNativeView('MobileTss');

export default function MobileTssView(props: MobileTssViewProps) {
  return <NativeView {...props} />;
}
