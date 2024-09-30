import { SVGProps } from 'react';

import { Match } from '../../../../lib/ui/base/Match';
import { ComponentWithValueProps } from '../../../../lib/ui/props';
import { DeviceType } from '../../utils/localPartyId';
import { DesktopIcon } from './DesktopIcon';
import { PhoneIcon } from './PhoneIcon';
import { TabletIcon } from './TabletIcon';

export const KeygenDeviceIcon = ({
  value,
  ...props
}: SVGProps<SVGSVGElement> & ComponentWithValueProps<DeviceType>) => {
  return (
    <Match
      value={value}
      desktop={() => <DesktopIcon {...props} />}
      phone={() => <PhoneIcon {...props} />}
      tablet={() => <TabletIcon {...props} />}
    />
  );
};
