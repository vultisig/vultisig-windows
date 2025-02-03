import { range } from '@lib/utils/array/range';
import { updateAtIndex } from '@lib/utils/array/updateAtIndex';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { verticalPadding } from '../../../lib/ui/css/verticalPadding';
import { Checkbox } from '../../../lib/ui/inputs/checkbox/Checkbox';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  getSwapTermCopyKey,
  swapTermsCount,
  useSwapTerms,
} from './state/swapTerms';

const Item = styled(Checkbox)`
  ${verticalPadding(10)}
`;

export const SwapTerms = () => {
  const { t } = useTranslation();

  const [value, setValue] = useSwapTerms();

  return (
    <VStack>
      {range(swapTermsCount).map(index => {
        const text = t(getSwapTermCopyKey(index));

        return (
          <Item
            key={index}
            label={text}
            value={value[index]}
            onChange={v =>
              setValue(prev => updateAtIndex(prev, index, () => v))
            }
          />
        );
      })}
    </VStack>
  );
};
