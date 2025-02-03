import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { verticalPadding } from '../../../lib/ui/css/verticalPadding';
import { Checkbox } from '../../../lib/ui/inputs/checkbox/Checkbox';
import { VStack } from '../../../lib/ui/layout/Stack';
import { range } from '@lib/utils/array/range';
import { updateAtIndex } from '@lib/utils/array/updateAtIndex';
import {
  getSendTermCopyKey,
  sendTermsCount,
  useSendTerms,
} from './state/sendTerms';

const Item = styled(Checkbox)`
  ${verticalPadding(10)}
`;

export const SendTerms = () => {
  const { t } = useTranslation();

  const [value, setValue] = useSendTerms();

  return (
    <VStack>
      {range(sendTermsCount).map(index => {
        const text = t(getSendTermCopyKey(index));

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
