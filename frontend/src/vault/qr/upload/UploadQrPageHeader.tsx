import styled from 'styled-components';
import { CenterAbsolutely } from '../../../lib/ui/layout/CenterAbsolutely';
import { Text } from '../../../lib/ui/text';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { centerContent } from '../../../lib/ui/css/centerContent';
import { sameDimensions } from '../../../lib/ui/css/sameDimensions';
import { ChevronLeftIcon } from '../../../lib/ui/icons/ChevronLeftIcon';
import { useNavigate } from 'react-router-dom';
import { getColor } from '../../../lib/ui/theme/getters';

const Container = styled.div`
  position: relative;
  height: 60px;
  width: 100%;
`;

const Back = styled(UnstyledButton)`
  ${centerContent};
  ${sameDimensions(40)};
  color: ${getColor('contrast')};
  font-size: 24px;
`;

export const UploadQrPageHeader = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Back onClick={() => navigate(-1)}>
        <ChevronLeftIcon />
      </Back>
      <CenterAbsolutely style={{ pointerEvents: 'none' }}>
        <Text color="contrast" weight="600" size={20}>
          Keysign
        </Text>
      </CenterAbsolutely>
    </Container>
  );
};
