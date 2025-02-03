import { SVGProps } from 'react';

import { Match } from '../../../lib/ui/base/Match';
import { InternetIcon } from '../../../lib/ui/icons/InternetIcon';
import { WifiIcon } from '../../../lib/ui/icons/WifiIcon';
import { ValueProp } from '../../../lib/ui/props';
import { KeygenServerType } from '../server/KeygenServerType';

export const KeygenServerTypeIcon = ({
  value,
  ...props
}: SVGProps<SVGSVGElement> & ValueProp<KeygenServerType>) => {
  return (
    <Match
      value={value}
      relay={() => <InternetIcon {...props} />}
      local={() => <WifiIcon {...props} />}
    />
  );
};
