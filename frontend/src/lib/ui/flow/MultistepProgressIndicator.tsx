import styled from 'styled-components';

import { range } from '../../utils/array/range';
import { round } from '../css/round';
import { sameDimensions } from '../css/sameDimensions';
import { HStack } from '../layout/Stack';
import { ComponentWithActiveState, ComponentWithValueProps } from '../props';
import { matchColor } from '../theme/getters';

type MultistepProgressIndicatorProps = ComponentWithValueProps<number> & {
  steps: number;
};

const Item = styled.div<ComponentWithActiveState>`
  ${sameDimensions(8)};
  ${round};
  background: ${matchColor('isActive', {
    true: 'primary',
    false: 'mistExtra',
  })};
`;

export const MultistepProgressIndicator = ({
  value,
  steps,
}: MultistepProgressIndicatorProps) => {
  return (
    <HStack gap={8}>
      {range(steps).map(index => (
        <Item key={index} isActive={index === value} />
      ))}
    </HStack>
  );
};
