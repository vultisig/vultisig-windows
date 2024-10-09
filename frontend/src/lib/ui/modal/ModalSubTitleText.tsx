import { ComponentProps } from 'react';

import { AsElementComponent } from '../props';
import { Text } from '../text';

export const ModalSubTitleText = (
  props: ComponentProps<typeof Text> & AsElementComponent
) => <Text color="supporting" as="div" {...props} />;
