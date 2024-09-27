import { SVGProps } from 'react';

import { Match } from '../../../lib/ui/base/Match';
import { InternetIcon } from '../../../lib/ui/icons/InternetIcon';
import { WifiIcon } from '../../../lib/ui/icons/WifiIcon';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { KeygenServerType } from '../KeygenServerType';

export const KeygenServerTypeIcon = ({
  value,
  ...props
}: SVGProps<SVGSVGElement> & ComponentWithValueProps<KeygenServerType>) => {
  return (
    <Match
      value={value}
      relay={() => <InternetIcon {...props} />}
      local={() => <WifiIcon {...props} />}
    />
  );
};
