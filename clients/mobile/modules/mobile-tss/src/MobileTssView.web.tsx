import * as React from 'react';

import { MobileTssViewProps } from './MobileTss.types';

export default function MobileTssView(props: MobileTssViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
