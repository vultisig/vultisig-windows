import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { UnstyledButton } from '../../../../../lib/ui/buttons/UnstyledButton';
import { borderRadius } from '../../../../../lib/ui/css/borderRadius';
import { centerContent } from '../../../../../lib/ui/css/centerContent';
import { horizontalPadding } from '../../../../../lib/ui/css/horizontalPadding';
import { getColor } from '../../../../../lib/ui/theme/getters';

const Container = styled(UnstyledButton)`
  ${borderRadius.m};
  background: ${getColor('foreground')};
  color: ${getColor('primaryAlt')};
  height: 100%;
  ${centerContent};
  ${horizontalPadding(20)};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`;

export const SaveCoinSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return <Container onClick={() => navigate(-1)}>{t('save')}</Container>;
};
