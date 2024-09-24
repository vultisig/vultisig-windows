import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '../../../lib/ui/buttons/Button';
import { toSizeUnit } from '../../../lib/ui/css/toSizeUnit';
import { ContainImage } from '../../../lib/ui/images/ContainImage';
import { SafeImage } from '../../../lib/ui/images/SafeImage';
import { VStack, vStack } from '../../../lib/ui/layout/Stack';
import { Panel } from '../../../lib/ui/panel/Panel';
import { TitledComponentProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { setupOptionsConfig } from './config';

export type SetupVaultOptionProps = TitledComponentProps & {
  artSrc: string;
  targetDestination: string;
  actionName: string;
};

const Container = styled(Panel)`
  width: ${toSizeUnit(setupOptionsConfig.optionWidth)};
  padding-top: 80px;

  ${vStack({
    alignItems: 'center',
    gap: 20,
  })}
`;

const ArtContainer = styled.div`
  width: 68px;
`;

export const SetupVaultOption = ({
  title,
  artSrc,
  targetDestination,
  actionName,
}: SetupVaultOptionProps) => {
  const { t } = useTranslation();

  return (
    <Container>
      <ArtContainer>
        <SafeImage src={artSrc} render={props => <ContainImage {...props} />} />
      </ArtContainer>
      <VStack alignItems="center">
        <Text color="contrast" size={14} family="mono">
          {t('this_device_is_the')}
        </Text>
        <Text color="contrast" size={20} weight="700">
          {title}
        </Text>
      </VStack>
      <Link style={{ alignSelf: 'stretch' }} to={targetDestination}>
        <Button as="div">{actionName}</Button>
      </Link>
    </Container>
  );
};
