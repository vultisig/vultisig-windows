import styled from 'styled-components';
import { centerContent } from '../../lib/ui/css/centerContent';
import { round } from '../../lib/ui/css/round';
import { sameDimensions } from '../../lib/ui/css/sameDimensions';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { getColor } from '../../lib/ui/theme/getters';
import { PictureIcon } from '../../lib/ui/icons/PictureIcon';
import { CoverImage } from '../../lib/ui/images/CoverImage';
import { SafeImage } from '../../lib/ui/images/SafeImage';

const Container = styled.div`
  ${sameDimensions(32)};
  ${centerContent};
  ${round};
  background: ${getColor('mist')};
  overflow: hidden;
  font-size: 14px;
`;

export const ChainEntityIcon = ({
  value,
}: Partial<ComponentWithValueProps<string>>) => {
  return (
    <Container>
      <SafeImage
        src={value}
        render={props => <CoverImage {...props} />}
        fallback={<PictureIcon />}
      />
    </Container>
  );
};
