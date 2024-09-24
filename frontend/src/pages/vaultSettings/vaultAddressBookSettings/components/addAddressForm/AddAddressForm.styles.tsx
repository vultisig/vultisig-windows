import styled from 'styled-components';

import { Input } from '../../../../../lib/ui/inputs/text-input/Input';
import { Panel } from '../../../../../lib/ui/panel/Panel';
import { getColor } from '../../../../../lib/ui/theme/getters';

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 32px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FormField = styled(Panel)`
  font-weight: 400;
  font-size: 16px;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FormInput = styled(Input)`
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
`;
